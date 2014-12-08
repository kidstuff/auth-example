package main

import (
	"fmt"
	"github.com/kidstuff/auth-mongo-mngr"
	"github.com/kidstuff/auth/authtool"
	"labix.org/v2/mgo"
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
		fmt.Println(err)
		return
	}

	defer session.Close()
	session.SetMode(mgo.Monotonic, true)
	db := session.DB(DB_NAME)
	// The auth-mongo-mngr require to run Setup function
	err = mgoauth.Setup(db)
	if err != nil {
		fmt.Println(err)
		return
	}
	// the system require these settings, read wiki to understand them.
	su := authtool.NewSetUp(mgoauth.NewMgoConfigMngr(db), mgoauth.NewMgoManager(db))
	settings := map[string]string{
		"auth_full_path":              "http://localhost:8080/auth",
		"auth_activate_redirect":      "http://localhost:8081/#!/welcome",
		"auth_approve_new_user":       "false",
		"auth_email_from":             "nvcnvn1@gmail.com",
		"auth_send_activate_email":    "true",
		"auth_activate_email_subject": "Active your account",
		"auth_activate_email_message": "Hi!\nPlease active your account by cliking here:\n%s",
		"auth_send_welcome_email":     "true",
		"auth_welcome_email_subject":  "Welcome!",
		"auth_welcome_email_message":  "Hi!\nWelcome you to join our community :)",
		"auth_reset_redirect":         "http://localhost:8081/#!/resetpassword/%s/%s",
		"auth_reset_email_subject":    "Password reset request",
		"auth_reset_email_message":    "Hi!\nTo reset your password please click the link bellow:\n%s",
	}
	fmt.Println("Set default seetings...")
	err = su.SetSettings(settings)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("Default settings setted!")

	fmt.Println("Add admin user...")
	var email, pwd string
	fmt.Println("Enter admin user Email:")
	fmt.Scanf("%s", &email)

	fmt.Println("Enter admin user Password:")
	fmt.Scanf("%s", &pwd)

	_, err = su.AddAdmin(email, pwd)
	if err != nil {
		panic(err)
	}
}
