const Mafia = require('../models/mafia-model')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

createRoom = (req, res) => {
    const nickname = req.body.nickname;
    const room = helper.makeid(5);;
    const player = helper.makeid(16);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const browser = req.headers['user-agent'];
    const user = {nickname : nickname,
                room : room,
                player_id : player,
                ip : ip,
                browser : browser,
                owner : true};

    if (nickname == null) {
        return res.status(400).json({
            success:false,
            error: 'No nickname'
        });
    }

    const mafia = new Mafia({
        roomid : room,
        owner : player,
        game: {
            state: "waiting"
        },
        players: {
            nickname : nickname,
            player_id : player,
            living : true
        },
        messages : {
            message : nickname + " has joined",
            nickname : "Game",
            player_id : "0"
        },
        votes : new Map(),
        trial : {
            votes : new Map()
        },
        night : new Map(),
        secret : new Map()

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
    const room_id = req.body.room_id;
    const player_id = helper.makeid(16);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const browser = req.headers['user-agent'];

    if (nickname == null || room_id == null) {
        return res.status(400).json({
            success:false,
            error: 'No room'
        });
    }

    const user = {nickname : nickname,
        room : room_id,
        player_id : player_id,
        ip : ip,
        browser : browser,
        owner : false};

    Mafia.findOneAndUpdate({roomid:room_id},
        {
            $push: {players: {
                nickname : nickname,
                player_id : player_id,
                living : true,
            },
            messages : {
                message : nickname + " has joined",
                nickname : "Game",
                player_id : "0"
            }
            }
        }
    ).then(() => {
        const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});
        
        // todo
        // send socket message to room of udpated message
        const socketConnection = require('../helpers/socket-singleton').connection();
        socketConnection.sendEvent("gameUpdate", "message", user.room);

        return res.status(201).json({
            success: true,
            nickname : user.nickname,
            room: room_id,
            player_id: player_id,
            token: token,
            message: 'joined room',
        })
    }).catch(error => {
        return res.status(400).json({
            error,
            message: 'Cannot Join Room',
        })
    });

}

// returns filterd game state
getRoom = (req, res) => {
    const token = req.query.token;

    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null) {
        return res.status(400).json({
            message: 'Can not verify token',
        })
    }

    Mafia.findOne({roomid:user.room}).lean().then((data) => {
        // console.log(data)
        if (data.game.state != 'waiting') {
            data.role = data.game.roles[user.player_id];
        }
        delete data['game']['evil_players'];
        delete data.game['good_players'];
        delete data.game['roles'];
        delete data.__id;
        delete data.createdAt;
        delete data.updatedAt;
        delete data['__v'];
        data.player_id = user.player_id;

        // filter secret messages for user
        let secrets = new Map(Object.entries(data.secret));
        data.secret_message = secrets.get(user.player_id);
        delete(data.secret)

        // tell players to update
        const socketConnection = require('../helpers/socket-singleton').connection();
        socketConnection.sendEvent("message", "hello3", user.room);
        
        return res.status(201).json({data});
    }).catch(error => {
        console.log(error)
        return res.status(400).json({
            error,
            message: 'Can not get room data',
        })
    });
}

module.exports = {
    getRoom,
    joinRoom,
    createRoom
}