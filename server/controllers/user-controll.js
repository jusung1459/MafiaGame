const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');
const { fork } = require('child_process');

StartRoom = (req, res) => {
    const socketConnection = require('../helpers/socket-singleton').connection();
    socketConnection.sendEvent("message", "hello2");

    const child_process = fork('./gameServer/game-server.js');
    child_process.send({"start":"hi"});
    child_process.on("message", (msg) => {
        console.log(msg);
        socketConnection.sendEvent("message", msg);
    });
    return res.status(200).json({
        success: true,
        message: "emit"
    });
    const token = req.body.token;
    if (token) {
        return res.status(401).json({
            success: false,
            message: "coutld not authenticate token"
        });
    }

    user = jwt.verify(token, process.env.JWT_KEY);
    
    return res.status(200).json({
        nickname : user.nickname,
        room : user.room,
        player_id : player_id,
        token
    })
    
}

module.exports = {
    StartRoom,
}