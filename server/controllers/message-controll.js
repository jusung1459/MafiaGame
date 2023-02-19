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
        Mafia.findOne({roomid:user.room}).lean().then((data) => {
            let state = data.game.state;
            // check if alive
            let player_status = data.players.find((player) => {return player.player_id === user.player_id});
            console.log(player_status);

            if (player_status.living == true) { // only alive players can talk
                if  (state === "trial") {
                    if (user.player_id === data.trial.trial_player) {
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
                        });
                    }
                } else if (state === "night") {
                    // only mafia can talk to each other
                    if (data.game.roles[user.player_id].includes("EVIL")) {
                        console.log("is evil")
                        let new_message = { "nickname" : user.nickname,
                                "player_id" : user.player_id,
                                "createdAt":new Date()};
                
                        new_message["message"] = message;

                        Mafia.updateOne({roomid:user.room}, {
                            $push: {
                                ["secret." + "evil"] : new_message,
                            }
                        }).then(() => {
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
                } else {
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
                    });
                }
            } else if (state.includes("end")) {
                // allow anyone to talk after game ends
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
                });
            } else if (player_status.living == false){
                // secret dead channel for dead
                let new_message = { "nickname" : user.nickname,
                                "player_id" : user.player_id,
                                "createdAt":new Date()};
                
                new_message["message"] = message;

                Mafia.updateOne({roomid:user.room}, {
                    $push: {
                        ["secret." + "dead"] : new_message,
                    }
                }).then(() => {
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