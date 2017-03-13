const io = require('socket.io-client')
const socket = io.connect()

const NodeRSA = require('node-rsa')
let key = new NodeRSA({b: 512})
key.generateKeyPair()
let privateKey = key.exportKey()
let publicKey = key.exportKey('public')

let encrypt = new JSEncrypt()
let decrypt = new JSEncrypt()

encrypt.setPublicKey(publicKey)
decrypt.setPrivateKey(privateKey)

let token = null;
let userName = null;
let userInfo = {};

let registerButton = document.getElementById("register-submit")
registerButton.onclick = () => {
    let userName = document.getElementById('register-username').value
    let pw = document.getElementById('register-pw').value
    socket.emit("register", {userName, pw, publicKey})
}

let loginButton = document.getElementById("login-submit")
loginButton.onclick = () => {
    let userName = document.getElementById('login-username').value
    let pw = document.getElementById('login-pw').value
    socket.emit("login", {userName, pw})
}

let searchButton = document.getElementById("search-submit")
searchButton.onclick = () => {
    let userName = document.getElementById('search-username').value
    socket.emit("search", {token, params: {userName}})
}

let contentButton = document.getElementById("content-submit")
contentButton.onclick = () => {
    let userName = document.getElementById('content-username').value
    let message = document.getElementById('content-text').value
    if(userInfo[userName]){
        encrypt.setPublicKey(userInfo[userName].publicKey)
        message = encrypt.encrypt(message)
        socket.emit("create-content", {token, content: {"toUser": userName, "message": message}})
    }
    else {
        console.log("search for user first");
    }

}

let contentsearchButton = document.getElementById("search-content-submit")
contentsearchButton.onclick = () => {
    let userName = document.getElementById('search-content-user').value
    socket.emit("content-search", {token, params: {"toUser": userName}})
}


function notifyEmit(e, data) {
    console.log("Event " + e + " with Data: " + JSON.stringify(data))

    if(e === "login" && data.token){
        token = data.token
        userName = data.userName
    }

    if(e === "search") {
        for (let user of data) {
            if (user.userName) {
                userInfo[user.userName] = user;
            }

        }
    }

    if (e === "content-search" && data[0] && data[0].toUser == userName) {
        for (let msg of data) {
            alert(decrypt.decrypt(msg.message))
        }
    }
}

socket.on('register', (data) => notifyEmit('register', data))
socket.on('login', (data) => notifyEmit('login', data))
socket.on('search', (data) => notifyEmit('search', data))
socket.on('create-content', (data) => notifyEmit('create-content', data))
socket.on('content-search', (data) => notifyEmit('content-search', data))
