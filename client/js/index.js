const io = require('socket.io-client')
const socket = io.connect("http://localhost:3000")

const NodeRSA = require('node-rsa')
let key = new NodeRSA({b: 512})
key.generateKeyPair()
let privateKey = key.exportKey()
let publicKey = key.exportKey('public')

let encrypt = new JSEncrypt()
let decrypt = new JSEncrypt()

encrypt.setPublicKey(publicKey)
decrypt.setPrivateKey(privateKey)

console.log(decrypt.decrypt(encrypt.encrypt("yey!")))


let token = null;

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
    socket.emit("search", {userName})
}


function notifyEmit(e, data) {
    alert("Event " + e + " with Data: " + JSON.stringify(data))

    if(e === "login" && data.token){
        token = data.token
    }
}

socket.on('register', (data) => notifyEmit('register', data))
socket.on('login', (data) => notifyEmit('login', data))
