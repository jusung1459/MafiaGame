const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');
const { fork } = require('child_process');


authenticate = (req, res) => {
    const nickname = req.body.nickname;
    const room = req.body.room;
    const player_id = req.body.player_id;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const browser = req.headers['user-agent'];
    const user = {nickname : nickname,
                room : room,
                player_id : player_id,
                ip : ip,
                browser : browser};
    
    const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});
    return res.status(200).json({
        nickname : user.nickname,
        room : user.room,
        player_id : player_id,
        token
    })

}

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
    authenticate,
    StartRoom
}