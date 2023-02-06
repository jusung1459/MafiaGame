const mongoose = require('mongoose')
const Schema = mongoose.Schema

// db connection
mongoose
    .connect('mongodb://172.18.0.1:27017/mafia', { useNewUrlParser: true })
    .then(() => {
        console.log('successfully connected to the database');
    })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

const MessagesSchema = new Schema({
    message : String,
    nickname : String,
    player_id : String
})

const PlayerSchema = new Schema({
    nickname : String,
    player_id : String
})

const VotesSchema = new Schema({
    from_id : String,
    to_id : String
})

const Mafia = new Schema(
    {
        roomid: { type: String, required: true },
        owner: { type: String, required: true },
        game: { 
            evil_players : [String],
            good_players : [String],
            roles : {
                type : Map,
                of : String    
            },
            state : { type: String, required: true }
        },
        players : [PlayerSchema],
        votes : [VotesSchema],
        messages : [MessagesSchema]
    },
    { timestamps: true },
)

MafiaDB = mongoose.model('mafia', Mafia)

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

process.on('message', (msg) => {
    console.log('Message from parent:', msg);
});

next_state = {
    // "waiting" : {
    //     "next" : "start",
    //     "time" : 10
    // },
    "start" : {
        "next" : "night",
        "time" : 20
    },
    "night" : {
        "next" : "day_talk",
        "time" : 40
    },
    "day_talk" : {
        "next" : "vote",
        "time" : 40
    },
    "vote" : {
        "next" : "after_vote_talk",
        "time" : 20
    },
    "after_vote_talk" : {
        "next" : "end",
        "time" : 20
    },

}

let room_id = process.argv[2]

class Game {
    constructor(room_id, data) {
        this.game_state = "start";
        this.room_id = room_id;
        this.data = data;
    }
}

let game = null;
const roles = ["ranger", "sasquatchEVIL", "camper", "camper", "littlefeetEVIL", "hunter", "camper", "bigfeetEVIL", "lumberjack", "camper"];
let counter = 0;

function initGame() {
    // getting game state
    MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        // console.log(data)
        game = new Game(room_id, data);

        // set roles
        let players = game.data.players;
        players = players.sort(() => Math.random() - 0.5);
        let evil_players = [];
        let good_players = [];
        let role_map = new Map();
        players.forEach(function(player, index) {
            role_map.set(player.player_id, roles[index]);
            if (roles[index].includes("EVIL")) {
                evil_players.push(player.player_id);
            } else {
                good_players.push(player.player_id);
            }
        });
        console.log(role_map)
        console.log(evil_players);
        console.log(good_players);

        MafiaDB.findOneAndUpdate({roomid:room_id}, {
            $set: { game: {
                    evil_players : evil_players,
                    good_players : good_players,
                    roles : role_map,
                    state: "start"
                }
            }
        }).then((data) => {
            // console.log(data);
            process.send({action : "get_roles"});
            counter = 20;
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });
}

function updateGame() {
    // getting game state
    MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        console.log(data)
        game.data = data;
        let game_state = game.data.game.state;
        console.log(game_state)

        if (game_state == "end") {
            process.exit(0);
        } else {
            game_state = next_state[game_state].next;
            counter = next_state[game_state].time;

            MafiaDB.findOneAndUpdate({roomid:room_id}, {
                $set: { 'game.state': game_state}
            }).then((data) => {
                // console.log(data);
                process.send({action : "update_game"});
            }).catch(error => {
                console.log(error);
            });
        }
    }).catch(error => {
        console.log(error);
    });
}

initGame();
  
setInterval(() => {
    process.send({ counter: counter-- });
    if (counter <= 0) {
        updateGame();
    }
    if (counter < -1) {
        process.exit(0);
    }
}, 1000);


/*
1. Owner starts room
2. server spins up new process
    - establish rolls 
    - server sends message to players rolls have been created
        - players make GET request for roll
            - server encrypts new roll with token given
            - player decrypts roll.
            - player disconects general room socket
            - player makes new socket again
                - server looks at token and subscribes them to socket room "room_id"+"roll(town/evil)"
    - waits 5seconds
3. Start game

*/