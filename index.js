let fs = require("fs")
let browserify = require("browserify")
let express = require('express');
let app = express();

let server = app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
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
        console.log("test");
        snap.users.register({userName, password, passwordConf: password, publicKey}, [], (err, data) => {
            client.emit("register", data)
            if (!!err) {
                console.log(err)
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

})


app.use(express.static(__dirname + '/client'));
