package main

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"strconv"
)

type SESNotificator struct {
	Port     int
	Server   string
	User     string
	Password string
}

func NewSESNotificator(port int, server, user, pwd string) *SESNotificator {
	s := &SESNotificator{}
	s.Port = port
	s.Server = server
	s.User = user
	s.Password = pwd
	return s
}

func (n *SESNotificator) SendMail(subject, message, from, to string) error {
	// Setup headers
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject

	// Setup message body
	body := ""
	for k, v := range headers {
		body += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	body += "\r\n" + message

	// Connect to the SMTP Server
	servername := n.Server + ":" + strconv.Itoa(n.Port)

	auth := smtp.PlainAuth("", n.User, n.Password, n.Server)

	// TLS config
	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         n.Server,
	}

	// Here is the key, you need to call tls.Dial instead of smtp.Dial
	// for smtp servers running on 465 that require an ssl connection
	// from the very beginning (no starttls)
	conn, err := tls.Dial("tcp", servername, tlsconfig)
	if err != nil {
		return err
	}

	c, err := smtp.NewClient(conn, n.Server)
	if err != nil {
		return err
	}

	if err = c.Auth(auth); err != nil {
		return err
	}

	if err = c.Mail(from); err != nil {
		return err
	}

	if err = c.Rcpt(to); err != nil {
		return err
	}

	w, err := c.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(body))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	return c.Quit()
}
