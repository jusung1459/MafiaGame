const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()

const db = require('./db')
const mafiaRouter = require('./routes/mafia-router')

require("dotenv").config();

const apiPort = 3000

var server = require('http').createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        credentials: false
    },
  });

const corsOptions = {
    origin: "http://localhost:8000",
    optionsSuccessStatus: 200   
};

app.use(cors(corsOptions));


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/api', mafiaRouter)

io.eio.pingTimeout = 120000; // 2 minutes
io.on('connection', (socket) => {
    socket.emit("message", "hello");
    console.log("User connect: " + socket.id);
});

server.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))

module.exports = {
    io,
}

// https://stackoverflow.com/questions/49980164/how-can-i-share-socket-io-into-other-modules-in-nodejs