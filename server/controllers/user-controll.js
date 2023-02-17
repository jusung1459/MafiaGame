const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');
const { fork } = require('child_process');

StartRoom = (req, res) => {
    const token = req.body.token;
    if (token) {
        const user = jwt.verify(token, process.env.JWT_KEY);
        // console.log(user);

        Mafia.findOne({roomid:user.room}).lean().then((data) => {
            if (user.player_id == data.owner) {
                if (data.game.state == "waiting" || data.game.state == "end") {
                    const child_process = fork('./gameServer/game-server.js', [user.room]);
                    // child_process.send({"start":"hi"});
                    child_process.on("message", (msg) => {
                        console.log(msg);
                        if (msg.action == "update_game") {
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", msg, user.room);
                        }
                        const socketConnection = require('../helpers/socket-singleton').connection();
                        socketConnection.sendEvent("message", msg, user.room);
                    });
                    return res.status(200).json({
                        success: true,
                        message: "started game"
                    });
                }
            }

        }).catch(error => {
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