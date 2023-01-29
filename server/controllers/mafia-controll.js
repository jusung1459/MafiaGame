const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

createRoom = (req, res) => {
    const nickname = req.body.nickname;
    const room = helper.makeid(5);
    const player = helper.makeid(16);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const browser = req.headers['user-agent'];
    const user = {nickname : nickname,
                room : room,
                player_id : player,
                ip : ip,
                browser : browser};

    if (nickname == null) {
        return res.status(400).json({
            success:false,
            error: 'No room'
        });
    }

    const mafia = new Mafia({
        roomid : room,
        owner : player,
    });
    if (!mafia) {
        return res.status(400).json({ success: false, error: err })
    }
    mafia.markModified("mafia")
    mafia.save().then(() => {
        const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});

        return res.status(201).json({
            success: true,
            nickname : user.nickname,
            room: user.room,
            player_id: user.player_idr,
            token: token,
            message: 'room created',
        })
    }).catch(error => {
        console.log(error)
        return res.status(400).json({
            error,
            message: 'Room not created',
        })
    })
}

joinRoom = (req, res) => {
    const nickname = req.body.nickname;
    const room_id = helper.makeid(5);
    const player_id = helper.makeid(16);

    if (nickname == null) {
        return res.status(400).json({
            success:false,
            error: 'No room'
        });
    }

    const mafia = new Mafia({
        roomid : room_id,
        owner : player_id,
    });
    if (!mafia) {
        return res.status(400).json({ success: false, error: err })
    }
    mafia.markModified("mafia")
    mafia.save().then(() => {
        const user = {
            nickname: nickname,
            roomid : room_id,
            id : player_id,
        }
        const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});

        return res.status(201).json({
            success: true,
            nickname : user.nickname,
            room: user.roomid,
            player_id: player_id,
            token: token,
            message: 'room created',
        })
    }).catch(error => {
        console.log(error)
        return res.status(400).json({
            error,
            message: 'Room not created',
        })
    })
}

getRoom = (req, res) => {
    return res.send("hello!")
}

module.exports = {
    getRoom,
    joinRoom,
    createRoom
}