const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

// ranger - can investigate
// camper - can do nothing
// hunter - can kill a person once
// lumberjack - can protect
// sasquatchEVIL - can kill
// littlefeetEVIL - can do nothing
// bigfeetEVIL - can 

role = (req, res) => {
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
                    voted_player_info = data.players.find(element => element.player_id == vote_player_id)
                    if (data.game.state == "vote") {
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
        case 'hunter':
            console.log("")
            break;
        case 'lumberjack':
            console.log("")
            break;
        case 'sasquatchEVIL':
            console.log("")
            break;
        default:
            console.log("default case");
    }

}

module.exports = {
    role,
}