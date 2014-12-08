package main

import (
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	"github.com/kidstuff/auth"
	"labix.org/v2/mgo"
	"labix.org/v2/mgo/bson"
	"net/http"
)

type Ticket struct {
	Id      bson.ObjectId `bson:"_id"`
	Content string
}

func CreateTicket(ctx *auth.AuthContext, rw http.ResponseWriter, req *http.Request) (int, error) {
	// developer can call:
	// user, err := ctx.ValidCurrentUser(false, nil)
	// to get the current logged user's infomation
	t := Ticket{}
	err := json.NewDecoder(req.Body).Decode(&t)
	req.Body.Close()
	if err != nil {
		return http.StatusBadRequest, err
	}

	t.Id = bson.NewObjectId()

	// save stuff to database
	db, ok := ctx.Value(DBKey).(*mgo.Database)
	if !ok {
		ctx.Logs.Errorf("Cannot access database")
		return http.StatusInternalServerError, errors.New("Cannot access database")
	}

	err = db.C("tickets").Insert(&t)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	json.NewEncoder(rw).Encode(&t)
	return http.StatusOK, nil
}

func GetTicket(ctx *auth.AuthContext, rw http.ResponseWriter, req *http.Request) (int, error) {
	sid := mux.Vars(req)["ticket_id"]
	if !bson.IsObjectIdHex(sid) {
		return http.StatusBadRequest, errors.New("Invalid id")
	}

	db, ok := ctx.Value(DBKey).(*mgo.Database)
	if !ok {
		ctx.Logs.Errorf("Cannot access database")
		return http.StatusInternalServerError, errors.New("Cannot access database")
	}

	t := Ticket{}
	err := db.C("tickets").FindId(bson.ObjectIdHex(sid)).One(&t)
	if err != nil {
		if err == mgo.ErrNotFound {
			return http.StatusNotFound, err
		}

		return http.StatusInternalServerError, err
	}

	json.NewEncoder(rw).Encode(&t)
	return http.StatusOK, nil
}

func DeleteTicket(ctx *auth.AuthContext, rw http.ResponseWriter, req *http.Request) (int, error) {
	return http.StatusOK, nil
}
