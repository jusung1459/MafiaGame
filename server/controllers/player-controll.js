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
        case 'kick':
            console.log("kick");
        case 'end':
            console.log("end");
        default:
            console.log("default case");
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
        socketConnection.sendEvent("message", "hello3");
        
        return res.status(201).json({data});
    }).catch(error => {
        return res.status(400).json({
            error,
            message: 'Can not get room data',
        })
    });

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
        socketConnection.sendEvent("message", "hello3");
        
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