require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketConnection = require('./helpers/socket-singleton');
const { fork } = require('child_process');

// setting up BullMQ GUI for testing
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue } = require('bullmq');

console.log(process.env.REDIS_URL)

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: [new BullMQAdapter(roomQueue)],
    serverAdapter: serverAdapter,
});

// run room consumer in own process
const child_process = fork('./gameServer/game-server-queue.js');
// child_process.send({"start":"hi"});
child_process.on("message", (msg) => {
    console.log(msg);
});


// setup express server
const app = express();

const {db, redisClient } = require('./db');
const mafiaRouter = require('./routes/mafia-router');

require("dotenv").config();

const apiPort = 3000;

var server = require('http').createServer(app);

const corsOptions = {
    // origin: "http://localhost:8000",
    optionsSuccessStatus: 200   
};

app.use(cors(corsOptions));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/api', mafiaRouter);
app.use('/admin/queues', serverAdapter.getRouter());

socketConnection.connect(server);

server.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));
