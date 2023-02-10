const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
socketConnection = require('./helpers/socket-singleton')

const app = express()

const db = require('./db')
const mafiaRouter = require('./routes/mafia-router')

require("dotenv").config();

const apiPort = 3000

var server = require('http').createServer(app);

const corsOptions = {
    // origin: "http://localhost:8000",
    optionsSuccessStatus: 200   
};

app.use(cors(corsOptions));


app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

app.use('/api', mafiaRouter)

socketConnection.connect(server);

server.listen(apiPort, () => console.log(`Server running on port ${apiPort}`))
