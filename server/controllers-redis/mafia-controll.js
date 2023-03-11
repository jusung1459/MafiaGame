const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');
const { redisClient } = require('../db/index')


createRoom = async (req, res) => {
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

    const data = {
        roomid : room,
        owner : player,
        game: {
            state: "waiting",
            "evil_players" : [

            ],
            "good_players" : [
    
            ],
            "dead_players" : [
    
            ]
        },
        players: [{
            nickname : nickname,
            player_id : player,
            living : true
        }],
        messages : [{
            message : nickname + " has joined",
            nickname : "Game",
            player_id : "0"
        }],
        votes : {},
        trial : {
            trial_player : "",
            votes : {}
        },
        night : {},
        secret : {
            evil : [],
            dead : []
        },
        role_counter : {}

    };
    if (!data) {
        return res.status(400).json({ success: false, error: err })
    }
    redisClient.json.set(`mafia:${room}`, '.', data)
    .then(() => {
        console.log('redis')
        const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});

        return res.status(201).json({
            success: true,
            nickname : user.nickname,
            room: user.room,
            player_id: user.player_idr,
            token: token,
            message: 'room created redis',
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

    const join_message = {
        message : nickname + " has joined",
        nickname : "Game",
        player_id : "0", 
        createdAt : new Date()
    }
    const new_player = {
        nickname : nickname,
        player_id : player_id,
        living : true,
    }
    const add_player = redisClient.json.arrAppend(`mafia:${room_id}`, '$.players', new_player);
    const add_message = redisClient.json.arrAppend(`mafia:${room_id}`, '$.messages', join_message);
    Promise.all([add_player, add_message]).then((result) => {
        if (result === null) {
            throw ("Room does not exist");
        }
        const token = jwt.sign(user, process.env.JWT_KEY, { expiresIn : '7d'});
        
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
            error: JSON.stringify(error),
            success:false,
            message: 'Cannot Join Room',
        })
    });

}

// returns filterd game state
getRoom = (req, res) => {
    // console.log(req.query)
    const token = req.query.token;
    
    const user = jwt.verify(token, process.env.JWT_KEY);
    if (user == null) {
        return res.status(400).json({
            message: 'Can not verify token',
        })
    }
    // console.log(user)
    redisClient.json.get(`mafia:${user.room}`).then((data) => {
        // console.log(data)

        // filter secret messages for user
        let secrets = new Map(Object.entries(data.secret));
        data.secret_message = secrets.get(user.player_id);
        if (data.secret_message === undefined) {
            data.secret_message = [];
        }

        let player_status = data.players.find((player) => {return player.player_id == user.player_id});
        if (player_status.living == false) {
            data.dead = secrets.get("dead");
            if (data.dead === undefined) {
                data.dead = [];
            }
        } else {
            data.dead = [];
        }

        data.dead_players = []
        if (data.game.dead_players != undefined) {
            data.game.dead_players.forEach((dead_player) => {
                let player_status = data.players.find((player) => {return player.player_id === dead_player});
                let dead_data = {
                    "dead_player_id" : dead_player,
                    "dead_player_nickname" : player_status.nickname,
                    "dead_player_role" : data.game.roles[dead_player]
                }
                data.dead_players.push(dead_data)
            })
        }
        delete(data.secret)
        data.evil = [];

        if (data.game.roles !== undefined) {
            const player_role = data.game.roles[user.player_id];
            const player_role_counter = data.role_counter[player_role];
            if (player_role_counter === undefined) {
                data.role_counter = -1;
            } else {
                data.role_counter = player_role_counter;
            }
        }

        if (data.game.state != 'waiting') {
            data.role = data.game.roles[user.player_id];

            if (data.game.roles[user.player_id].includes("EVIL")) {
                data.evil_chat = secrets.get("evil");
                if (data.evil_chat == undefined) {
                    data.evil_chat  = [];
                }
            } else {
                data.evil_chat  = [];
            }
        }
        delete data['game']['evil_players'];
        delete data.game['good_players'];
        delete data.game['roles'];
        delete data.__id;
        delete data.createdAt;
        delete data.updatedAt;
        delete data['__v'];
        data.player_id = user.player_id;

        // tell players to update
        const socketConnection = require('../helpers/socket-singleton').connection();
        socketConnection.sendEvent("message", "update", user.room);
        
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