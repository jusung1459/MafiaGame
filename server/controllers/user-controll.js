const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

authenticate = (req, res) => {
    const nickname = req.body.nickname;
    const room = req.body.room;
    const player_id = req.body.player_id;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const browser = req.headers['user-agent'];
    const user = {nickname : nickname,
                room : room,
                player_id : player_id,
                ip : ip,
                browser : browser};
    
    const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});
    return res.status(200).json({
        nickname : user.nickname,
        room : user.room,
        player_id : player_id,
        token
    })

}

connectRoom = (req, res) => {
    const token = req.body.token;
    if (!token) {
        user = jwt.verify(token, process.env.JWT_KEY);
    
        return res.status(200).json({
            nickname : user.nickname,
            room : user.room,
            player_id : player_id,
            token
        })
    }
    return res.status(401).json({
        success: false,
        message: "coutld not authenticate token"
    });
}

module.exports = {
    authenticate,
    connectRoom
}