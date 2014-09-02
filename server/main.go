package main

import (
	"github.com/gorilla/mux"
	"github.com/kidstuff/auth"
	"github.com/kidstuff/auth-mongo-mngr"
	"labix.org/v2/mgo"
	"net/http"
	"os"
)

func main() {
	MONGODB_URL := os.Getenv("MONGODB_URL")
	SERVER_URL := os.Getenv("SERVER_URL")
	DB_NAME := os.Getenv("DB_NAME")

	if len(MONGODB_URL) == 0 {
		MONGODB_URL = "localhost"
	}

	if len(SERVER_URL) == 0 {
		SERVER_URL = ":8080"
	}

	if len(DB_NAME) == 0 {
		DB_NAME = "kidstuff_auth"
	}

	session, err := mgo.Dial(MONGODB_URL)
	if err != nil {
		panic(err)
	}
	defer session.Close()
	session.SetMode(mgo.Monotonic, true)

	auth.DEFAULT_NOTIFICATOR = NewSESNotificator(465, "email-smtp.us-west-2.amazonaws.com", "AKIAJDJGIHPM5IS7C5HQ", "AkCf7PkmnokIuls3/2rl1EOFdhqlQVvajeM77mOHoXOR")
	mgoauth.Initial(session.DB(DB_NAME))

	r := mux.NewRouter()
	auth.Serve(r.PathPrefix("/auth").Subrouter())

	http.ListenAndServe(SERVER_URL, r)
}
