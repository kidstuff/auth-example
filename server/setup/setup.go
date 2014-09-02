package main

import (
	"github.com/kidstuff/auth-mongo-mngr"
	"github.com/kidstuff/auth/model"
	"labix.org/v2/mgo"
	"log"
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
	db := session.DB(DB_NAME)

	err = mgoauth.EnsureIndex(db)
	if err != nil {
		log.Println(err)
	}

	conf := mgoauth.NewMgoConfigMngr(db)
	settings := map[string]string{
		"auth_full_path":              "http://localhost:8080/auth",
		"auth_activate_page":          "http://localhost:8082/#!/user/%s/active?code=%s",
		"auth_approve_new_user":       "false",
		"auth_email_from":             "nvcnvn1@gmail.com",
		"auth_send_activate_email":    "true",
		"auth_activate_email_subject": "Active your account",
		"auth_activate_email_message": "Hi!\nPlease active your account by cliking here:\n%s",
		"auth_send_welcome_email":     "true",
		"auth_welcome_email_subject":  "Welcome!",
		"auth_welcome_email_message":  "Hi!\nWelcome you to join our community :)",
	}
	err = conf.SetMulti(settings)
	if err != nil {
		log.Println(err)
	}

	groupMngr := mgoauth.NewMgoGroupManager(db)
	groupName := "admin"
	g, err := groupMngr.FindByName(groupName)
	if err != nil {
		g = &model.Group{}
		g.Name = &groupName
		g.Privilege = []string{"manage_user"}
		g, err = groupMngr.AddDetail(g)
		if err != nil {
			log.Println(err)
		}
	}

	userMngr := mgoauth.NewMgoUserManager(db, groupMngr)
	email := "nvcnvn1@gmail.com"
	u, err := userMngr.FindByEmail(email)
	if err != nil {
		u = &model.User{}
		u.Email = &email
		u.ChangePassword("zaq123edc")
		g2 := model.Group{}
		g2.Id = g.Id
		g2.Name = g.Name
		u.Groups = []model.Group{g2}
		t := true
		u.Approved = &t
		u.Privilege = g.Privilege
		u, err = userMngr.AddDetail(u)
		if err != nil {
			log.Println(err)
		}
	}
}
