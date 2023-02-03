const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

message = (req, res) => {
    const token = req.body.token;
    const message = req.body.message;

    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null) {
        return res.status(400).json({
            message: 'Invalid Token',
        })
    };

    if (message != '') {
        Mafia.findOneAndUpdate({roomid:user.room},
            {   
                $push : {
                    messages : {
                        message : message,
                        nickname : user.nickname,
                        player_id : user.player_id
                    }
                }
            }
        ).then(() => {
            // tell players to update
            const socketConnection = require('../helpers/socket-singleton').connection();
            socketConnection.sendEvent("gameUpdate", "message", user.room);
    
            return res.status(201).json({
                success: true,
                message: 'message sent',
            })
        }).catch(error => {
            console.log(error)
            return res.status(400).json({
                error,
                message: 'Cannot send message',
            })
        });
    }

}

module.exports = {
    message,
}