auth-example
============

Example project with:  
* https://github.com/kidstuff/auth
* https://github.com/kidstuff/auth-mongo-mngr
* https://github.com/kidstuff/auth-angular-client

### Setup sever
This project require MongoDb installed in your machine.  
After cloning the project, cd to server/tools folder an run setup.go:  
```
cd /path/to/auth-example/server/tools
go run setup.go
```
The setup.go script will aut connect to MongoDB at "localhost", you can set **MONGODB_URL** env to specific your server and **DB_NAME** to choose database name.  
The script will ask you for default admin account email/password.

### Build and Run server
```
cd /path/to/auth-example/server
go get
go build
./server
```
By default the server app will conect to MongoDb at "localhost" with database name "kidstuff_auth" and serving at "localhost:8080", set the **MONGODB_URL**, **DB_NAME** and **SERVER_URL** behavior to change them.  

### Build and Run client (the web front-end)
We have a "custom javascript builder" base on [Google Closure Compiler](https://developers.google.com/closure/compiler/) that reuqire java installed in your machine.  
Download [compiler-latest.zip](http://dl.google.com/closure-compiler/compiler-latest.zip), extract that file and move the **compiler.jar** to client folder.
```
cd /path/to/auth-example/client
go run client.go
```
If the output like:
```
2014/12/09 10:40:36 Compiling script at /path/to/client/src
2014/12/09 10:40:36 Serving client at http://localhost:8081
```
It should work.  
To change the port to something else instead of "8081":
```
cd /path/to/auth-example/client
go run client.go -http=:8082
```

**Note**: if you change the location of server or front-end, please go to "/path/to/client/src/app/app.js" and modify value of **config.apiURL** and **config.clientURL** to match your config.  
After saving the file, the client will rebuild the javascript, you still need to reload the page in browser.  