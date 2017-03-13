let fs = require("fs")
let browserify = require("browserify")
let express = require('express');
let app = express();

let server = app.listen(4000, function() {
	console.log('Example app listening on port 4000!');
});

let io = require('socket.io')(server)

const snap = require('oh.snap').init({
    "type": "mongodb",
    "host": "mongodb://127.0.0.1:27017/",
    "dataStore": "snap-chat",
    "login": "",
    "password": ""
})



browserify("./client/js/index.js")
	.transform("babelify", {
		presets: ["es2015"]
	})
	.bundle()
	.pipe(fs.createWriteStream(__dirname + "/client/bundle.js"));

app.use(express.static('static'));

io.on('connection', function(client) {
	console.log('Client connected...');

    client.on('register', function(data) {
        let userName = data.userName
        let password = data.pw
		let publicKey = data.publicKey
        console.log(publicKey);
        snap.users.register({userName, password, passwordConf: password, publicKey}, [], (err, data) => {

            if (!!err) {
                console.log(err)
                client.emit("register", err)
            }
            else {
                client.emit("register", data)
            }

        })
	})

    client.on('login', function(data) {
        let userName = data.userName
        let password = data.pw
        console.log("test");
        snap.users.login({userName, password}, (err, data) => {

            if (!!err) {
                console.log(err)
                client.emit("login", err)
            }
            else {
                client.emit("login", data)
            }

        })
	})


    client.on('search', function(data) {
        snap.users.get(data.token, data.params, [], (err, data) => {

            if (!!err) {
                console.log(err)
                client.emit("search", err)
            }
            else {
                client.emit("search", data)
            }

        })
	})

    client.on('create-content', function(data) {
        snap.content.create(data.token, data.content, [], (err, data) => {
            if (!!err) {
                console.log(err)
                client.emit("create-content", err)
            }
            else {
                client.emit("create-content", data)
            }

        })
	})

    client.on('content-search', function(data) {
        snap.content.get(data.token, data.params, [], (err, data) => {
            if (!!err) {
                console.log(err)
                client.emit("content-search", err)
            }
            else {
                client.emit("content-search", data)
            }

        })
	})

})


app.use(express.static(__dirname + '/client'));
