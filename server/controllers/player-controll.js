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

    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null) {
        return res.status(400).json({
            message: 'Can not verify token',
        })
    }

    Mafia.findOne({roomid:user.room}).lean().then((data) => {
        delete data['game']['evil_players'];
        delete data.game['good_players'];
        delete data.__id;
        delete data.createdAt;
        delete data.updatedAt;
        delete data['__v'];

        // tell players to update
        const socketConnection = require('../helpers/socket-singleton').connection();
        socketConnection.sendEvent("message", "hello3", user.room);
        
        return res.status(201).json({data});
    }).catch(error => {
        return res.status(400).json({
            error,
            message: 'Can not get room data',
        })
    });

}

module.exports = {
    owner,
    player,
}