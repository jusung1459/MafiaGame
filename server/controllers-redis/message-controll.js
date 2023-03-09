const { redisClient } = require('../db/index')
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
        redisClient.json.get(`mafia:${user.room}`).then((data) => {
            console.log(data)
            let state = data.game.state;
            // check if alive
            let player_status = data.players.find((player) => {return player.player_id === user.player_id});
            console.log(player_status);

            if (player_status.living == true) { // only alive players can talk
                if  (state === "trial") { // only player on trial can talk
                    if (user.player_id === data.trial.trial_player) {
                        let message = {
                            message : message,
                            nickname : user.nickname,
                            player_id : user.player_id
                        }
                        redisClient.json.arrAppend(`mafia:${user.room}`, '$.messages', message).then(() => {
                            // tell players to update
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", "message", user.room);
                    
                            return res.status(201).json({
                                success: true,
                                message: 'message sent',
                            })
                        });
                    }
                } else if (state === "night") { // only mafia can talk to each other
                    if (data.game.roles[user.player_id].includes("EVIL")) {
                        console.log("is evil")
                        let new_message = { "nickname" : user.nickname,
                                "player_id" : user.player_id,
                                "createdAt":new Date()};
                
                        new_message["message"] = message;

                        redisClient.json.arrAppend(`mafia:${user.room}`, '$.secret', new_message)
                        .then(() => {
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", "message", user.room);

                            return res.status(201).json({
                                success: true,
                                message: 'message sent',
                            })
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                } else { // anyone can talk
                    let new_message = {
                        message : message,
                        nickname : user.nickname,
                        player_id : user.player_id
                    }
                    redisClient.json.arrAppend(`mafia:${user.room}`, '$.messages', new_message).then(() => {
                        // tell players to update
                        const socketConnection = require('../helpers/socket-singleton').connection();
                        socketConnection.sendEvent("gameUpdate", "message", user.room);
                
                        return res.status(201).json({
                            success: true,
                            message: 'message sent',
                        })
                    });
                }
            } else if (state.includes("end")) {
                // allow anyone to talk after game ends
                let message = {
                    message : message,
                    nickname : user.nickname,
                    player_id : user.player_id
                }
                redisClient.json.arrAppend(`mafia:${user.room}`, '$.messages', message).then(() => {
                    // tell players to update
                    const socketConnection = require('../helpers/socket-singleton').connection();
                    socketConnection.sendEvent("gameUpdate", "message", user.room);
            
                    return res.status(201).json({
                        success: true,
                        message: 'message sent',
                    })
                });
            } else if (player_status.living == false){
                // secret dead channel for dead
                let new_message = { "nickname" : user.nickname,
                                "player_id" : user.player_id,
                                "createdAt":new Date()};
                
                new_message["message"] = message;

                redisClient.json.arrAppend(`mafia:${user.room}`, '$.dead', new_message)
                .then(() => {
                    const socketConnection = require('../helpers/socket-singleton').connection();
                        socketConnection.sendEvent("gameUpdate", "message", user.room);

                    return res.status(201).json({
                        success: true,
                        message: 'message sent',
                    })
                }).catch(error => {
                    console.log(error);
                });
                
            }
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