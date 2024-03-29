const { redisClient } = require('../db/index')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');
const { Queue } = require('bullmq');
const { fork } = require('child_process');
const Room = require('../gameServer/room');

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

StartRoom = (req, res) => {
    const token = req.body.token;
    if (token) {
        const user = jwt.verify(token, process.env.JWT_KEY);
        // console.log(user);

        redisClient.json.get(`mafia:${user.room}`).then((data) => {
            if (user.player_id == data.owner) {
                if (data.game.state == "waiting" || data.game.state == "end") {

                    let room = new Room(user.room, 10, 900, 0);
                    room.initGame();
                    const socketConnection = require('../helpers/socket-singleton').connection();
                    socketConnection.sendEvent("gameUpdate", "update", user.room);

                    // add job to queue
                    roomQueue.add('room', 
                                    { room: user.room, 
                                        tick:10, 
                                        total_tick:900,
                                        day_counter:0 },  
                                    { delay: 1000 })
                    .then((data) => console.log(data.data));

                    return res.status(200).json({
                        success: true,
                        message: "started game"
                    });
                }
            }

        }).catch(error => {
            console.log(error)
            return res.status(401).json({
                success: false,
                message: "coutld not authenticate token"
            });
        });
    } else {
        return res.status(401).json({
            success: false,
            message: "coutld not authenticate token"
        });
    }
    
}

module.exports = {
    StartRoom,
}