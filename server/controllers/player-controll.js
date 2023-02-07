const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

owner = (req, res) => {
    const token = req.body.token;
    const action = req.body.action;

    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null || user.owner == false) {
        return res.status(400).json({
            message: 'Invalid Token',
        })
    };

    switch (action) {
        case 'kick-player':
            const kick_player_id = req.body.kick_player_id;
            if (kick_player_id != null) {
                Mafia.findOne({roomid:user.room}).lean().then((data) => {
                    if (data.game.state == "waiting" || data.game.state == "end") {
                        Mafia.updateOne({roomid:user.room}, {
                            $pull: {
                                players : {
                                    player_id : kick_player_id
                                },
                            }
                        }).then((data) => {
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", "message", user.room);
        
                            return res.status(201).json(
                                {success: true,
                                message: 'kicked player: ' + kick_player_id,});
                        }).catch(error => {
                            return res.status(400).json({
                                error,
                                message: 'Cant kick player: ' + kick_player_id
                            })
                        });
                    }
                }).catch(error => {
                    return res.status(400).json({
                        error,
                        message: 'Cant kick player: ' + kick_player_id
                    })
                });
            }
            console.log("kick");
            break;
        case 'end':
            console.log("end");
            break;
        default:
            console.log("default case");
    }

}

player = (req, res) => {
    const token = req.body.token;
    const action = req.body.action;

    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null) {
        return res.status(400).json({
            message: 'Invalid Token',
        })
    };

    switch (action) {
        case 'vote-player':
            const vote_player_id = req.body.kick_player_id;
            if (vote_player_id != null) {
                Mafia.findOne({roomid:user.room}).lean().then((data) => {
                    if (data.game.state == "vote") {
                        let new_votes = data.votes;
                        console.log(new_votes);
                        console.log(typeof new_votes);
                        if (new_votes == undefined) {
                            new_votes = new Map();
                        }
                        let vote_msg = user.nickname + " voted";
                        new_votes[user.player_id] = vote_player_id;
                        Mafia.updateOne({roomid:user.room}, {
                            $set: {
                                votes : new_votes,
                            },
                            $push : {
                                messages : {
                                    message : vote_msg,
                                    nickname : "game",
                                    player_id : 0
                                }
                            }
                        }).then((data) => {
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", "message", user.room);
        
                            return res.status(201).json(
                                {success: true,
                                message: 'voted player: ' + vote_player_id,});
                        }).catch(error => {
                            console.log(error);
                            return res.status(400).json({
                                error,
                                message: 'cant voted player: ' + vote_player_id
                            })
                        });
                    }
                }).catch(error => {
                    console.log(error);
                    return res.status(400).json({
                        error,
                        message: 'Cant vote player: ' + vote_player_id
                    })
                });
            }
            console.log("kick");
            break;
        case 'end':
            console.log("end");
            break;
        default:
            console.log("default case");
    }

}

module.exports = {
    owner,
    player,
}