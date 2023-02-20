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
            const kick_player_id = req.body.chosen_player_id;
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
            const vote_player_id = req.body.chosen_player_id;
            if (vote_player_id != null) {
                Mafia.findOne({roomid:user.room}).lean().then((data) => {
                    voted_player_info = data.players.find(element => element.player_id == vote_player_id)
                    const player_info = data.players.find(element => element.player_id == user.player_id);
                    // console.log(voted_player_info)
                    // console.log(player_info)
                    if (data.game.state == "vote" && (voted_player_info.living && player_info.living)) {
                        let new_votes = data.votes;
                        if (new_votes == undefined) {
                            new_votes = new Map();
                        }
                        let vote_msg = user.nickname + " voted for " + voted_player_info.nickname;
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
                                message: 'cant vote player: ' + vote_player_id
                            })
                        });
                    } else {
                        console.log("cant vote")
                        return res.status(200).json({
                            message: 'Cant vote player: ' + vote_player_id
                        })
                    }
                }).catch(error => {
                    console.log(error);
                    return res.status(400).json({
                        error,
                        message: 'Cant vote player: ' + vote_player_id
                    })
                });
            }
            break;
        case 'trial-vote-player':
            const vote = req.body.vote;
            const trial_player_id = "trial.votes."+String(user.player_id)
            Mafia.findOne({roomid:user.room}).lean().then((data) => {

                if (data.game.state == "trial") {
                    if (vote == "guilty" || vote == "inno") {
                        Mafia.updateOne({roomid:user.room}, {
                            $set: {
                                [trial_player_id] : String(req.body.vote),
                            },
                        }).then((data) => {
                            const socketConnection = require('../helpers/socket-singleton').connection();
                            socketConnection.sendEvent("gameUpdate", "message", user.room);

                            return res.status(201).json(
                                {success: true,
                                message: 'voted player: ' + user.player_id,});
                        }).catch(error => {
                            console.log(error);
                            return res.status(400).json({
                                error,
                                message: 'cant vote player: ' + user.player_id
                            })
                        });
                    } else {
                        return res.status(400).json({
                            message: 'Cant vote trial player',
                        })
                    }
                }
            }).catch(error => {
                console.log(error);
                return res.status(400).json({
                    error,
                    message: 'Cant vote player: ' + user.player_id
                })
            });
            break;
        default:
            console.log("default case");
    }

}

module.exports = {
    owner,
    player,
}