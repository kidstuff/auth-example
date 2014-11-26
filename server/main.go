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
	auth.DEFAULT_LOGGER, _ = auth.NewSysLogger("kidstuff/auth")
	mgoauth.Initial(session.DB(DB_NAME))

	r := mux.NewRouter()
	auth.Serve(r.PathPrefix("/auth").Subrouter())

	http.ListenAndServe(SERVER_URL, &AuthServer{r})
}

type AuthServer struct {
	r *mux.Router
}

func (s *AuthServer) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	if origin := req.Header.Get("Origin"); validOrigin(origin) {
		rw.Header().Set("Access-Control-Allow-Origin", origin)
		rw.Header().Set("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE")
		rw.Header().Set("Access-Control-Allow-Headers",
			"Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	}
	if req.Method == "OPTIONS" {
		return
	}
	s.r.ServeHTTP(rw, req)
}

func validOrigin(origin string) bool {
	allowOrigin := []string{
		"http://localhost:8081",
	}

	for _, v := range allowOrigin {
		if origin == v {
			return true
		}
	}

	return false
}
