package main

import (
	"encoding/base64"
	"encoding/json"
	"github.com/gorilla/securecookie"
	"github.com/kidstuff/auth"
	"github.com/kidstuff/auth/authmodel"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

type FBLogin struct {
	AppID       string
	AppSecret   string
	RedirectURI string
	client      *http.Client
	fbGrap      string
	fbOAuth     string
}

type FBAccessToken struct {
	AccessToken string
	ExpireOn    time.Time
}

func NewFBLogin(id, secret, redirect string, client *http.Client) *FBLogin {
	f := &FBLogin{}
	f.AppID = id
	f.AppSecret = secret
	f.RedirectURI = redirect
	f.client = client

	// for a shorter code
	f.fbGrap = "https://graph.facebook.com/v2.2"
	f.fbOAuth = "https://graph.facebook.com/oauth/access_token"

	return f
}

func (f *FBLogin) GetAccessToken(code string) (*FBAccessToken, error) {
	v := url.Values{}
	v.Set("client_id", f.AppID)
	v.Set("client_secret", f.AppSecret)
	v.Set("redirect_uri", f.RedirectURI)
	v.Set("code", code)
	resp, err := f.client.Get(f.fbOAuth + "?" + v.Encode())
	if err != nil {
		return nil, err
	}

	b, err := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	if err != nil {
		return nil, err
	}

	m, err := url.ParseQuery(string(b))
	if err != nil {
		return nil, err
	}

	sec, err := strconv.Atoi(m.Get("expires"))
	if err != nil {
		return nil, err
	}

	token := &FBAccessToken{}
	token.ExpireOn = time.Now().Add(time.Duration(sec) * time.Minute)
	token.AccessToken = m.Get("access_token")

	return token, nil
}

func (f *FBLogin) GetUser(fields string, token *FBAccessToken) (map[string]string, error) {
	v := url.Values{}
	v.Set("access_token", token.AccessToken)
	v.Set("fields", fields)
	resp, err := f.client.Get(f.fbGrap + "/me?" + v.Encode())
	if err != nil {
		return nil, err
	}

	user := map[string]string{}
	err = json.NewDecoder(resp.Body).Decode(&user)
	resp.Body.Close()
	if err != nil {
		return nil, err
	}

	return user, nil

}

func sendWelcomeMailtoFBUser(ctx *auth.AuthContext, email, pwd string) error {
	mailSettings, err := ctx.Settings.GetMulti([]string{
		"auth_welcome_email_subject",
		"auth_email_from",
	})
	if err != nil {
		return err
	}

	message := `Hi Facebook user :D
	Thanks you for using Facebook to login to our website!
	We also creat a password for you if you like a "traditional login", here is it:
	Email: ` + email + `
	Password: ` + pwd

	return ctx.Notifications.SendMail(ctx,
		mailSettings["auth_welcome_email_subject"],
		message,
		mailSettings["auth_email_from"], email)
}

func FacebookLogin(ctx *auth.AuthContext, rw http.ResponseWriter, req *http.Request) (int, error) {
	code := req.FormValue("code")
	redirect_uri := req.FormValue("redirect_uri")

	fb := NewFBLogin(os.Getenv("FB_APP_ID"), os.Getenv("FB_APP_SECRET"), redirect_uri,
		http.DefaultClient)

	token, err := fb.GetAccessToken(code)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	fbUser, err := fb.GetUser("id,email", token)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	email, ok := fbUser["email"]
	if !ok || len(email) < 3 {
		return http.StatusInternalServerError, err
	}

	status := http.StatusOK
	u, err := ctx.Auth.FindUserByEmail(email)
	if err == authmodel.ErrNotFound {
		// create new user with whatever password,
		// this will generate a 24-random-character,
		// I think it pretty secure password
		pwd := base64.URLEncoding.EncodeToString(securecookie.GenerateRandomKey(16))
		u, err = ctx.Auth.AddUser(email, pwd, true)
		if err != nil {
			return http.StatusInternalServerError, err
		}

		// the send mail functiuon have soem feature, we will talk about them next article.
		err = sendWelcomeMailtoFBUser(ctx, email, pwd)
		if err != nil {
			ctx.Logs.Errorf("FB user welcome mail failed: %s", err)
			status = http.StatusAccepted
		}

	} else if err != nil {
		return http.StatusInternalServerError, err
	}

	// user already regis with the same email, log them in
	tokenStr, err := ctx.Auth.Login(*u.Id, auth.OnlineThreshold)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	// You only need to return the token, but the front-end ma keep some user infomation
	// for future usage. And this is exactly the same structure our /tokens endpoint use.
	inf := struct {
		User        *authmodel.User
		ExpiredOn   time.Time
		AccessToken string
	}{u, time.Now().Add(auth.OnlineThreshold), tokenStr}

	return status, json.NewEncoder(rw).Encode(&inf)
}
