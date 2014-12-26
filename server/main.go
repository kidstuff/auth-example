package main

import (
	"github.com/gorilla/context"
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
	db := session.DB(DB_NAME)

	// NewSESNotificator return an auth.Notificator
	auth.DEFAULT_NOTIFICATOR = NewSESNotificator(465, "email-smtp.us-west-2.amazonaws.com", "AKIAJDJGIHPM5IS7C5HQ", "AkCf7PkmnokIuls3/2rl1EOFdhqlQVvajeM77mOHoXOR")
	// And about Logger interface http://godoc.org/github.com/kidstuff/auth#Logger
	auth.DEFAULT_LOGGER, _ = auth.NewSysLogger("kidstuff/auth")
	// Initial is a function from kidstuff/auth-mongo-mngr driver,
	// assign database will use with the auth system.
	// Its also tell the main kidstuff/auth package to use it at the "manager",
	// mostly, after this line, the developer don't need to import the mananger in their code.
	// The name "Initial" is specific by manager packge, so remember to check it docuemnt.
	mgoauth.Initial(db)

	// We use gorilla/mux, you don't need to use it with the other part of you app.
	// But some kidstuff/auth convenient function require a specific structrue of the handle
	// routed with gorilla/mux. We will talk about it later.
	r := mux.NewRouter()

	// auth.Serve will panic if the manager doesn't config the package right.
	// Now we have the auth REST API run at example.com/auth/xxx.
	// To know what is the xxx part, read http://kidstuff.github.io/swagger/#!/default
	auth.Serve(r.PathPrefix("/auth").Subrouter())

	// the CreateTicket only run for a "logged" user
	r.Handle("/users/{user_id}/tickets",
		auth.HANDLER_REGISTER(CreateTicket, true, nil)).Methods("POST")

	r.Handle("/users/{user_id}/tickets/{ticket_id}",
		auth.HANDLER_REGISTER(GetTicket, true, []string{"manage_content"})).Methods("GET")

	r.Handle("/users/{user_id}/tickets/{ticket_id}",
		auth.HANDLER_REGISTER(DeleteTicket, true, []string{"manage_content"})).Methods("DELETE")

	r.Handle("/facebook_login",
		auth.HANDLER_REGISTER(FacebookLogin, false, nil))

	http.ListenAndServe(SERVER_URL, &AuthServer{r, db})
}

type ctxKey int

const (
	DBKey ctxKey = iota
)

// AuthServer or what kind of name you like
type AuthServer struct {
	r  *mux.Router
	db *mgo.Database
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

	cloneDB := s.db.Session.Clone().DB(s.db.Name)
	defer cloneDB.Session.Close()
	context.Set(req, DBKey, cloneDB)

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
