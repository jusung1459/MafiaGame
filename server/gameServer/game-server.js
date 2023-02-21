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
},
{ timestamps: true })

const PlayerSchema = new Schema({
    nickname : String,
    player_id : String,
    living : Boolean,
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
        votes : {
            type : Map,
            of : String    
        },
        trial : {
            trial_player : String,
            votes : {
                type : Map,
                of : String  
            }  
        },
        night : {
            type: Map,
            of : new Schema({
                player_id: String,
                against_id: String
            })
        },
        secret : {
            type: Map,
            of : [MessagesSchema]
        },
        messages : [MessagesSchema],
        role_counter : {
            type : Map,
            of : Number
        }
    },
    { timestamps: true },
)

MafiaDB = mongoose.model('mafia', Mafia)

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

process.on('message', (msg) => {
    console.log('Message from parent:', msg);
});

next_state = {
    "starting" : {
        "next" : "start",
        "time" : 10
    },
    "start" : {
        "next" : "night",
        "time" : 5
    },
    "night" : {
        "next" : "day_talk",
        "time" : 5
    },
    "day_talk" : {
        "next" : "vote",
        "time" : 5
    },
    "vote" : {
        "next" : "trial",
        "time" : 5
    },
    "trial" : {
        "next" : "night",
        "time" : 5
    },
    "after_trial_talk" : {
        "next" : "night",
        "time" : 5
    },
    "end" : {
        "next" : "end",
        "time" : 1,
    },
    "end-mafia" : {
        "next" : "end-mafia",
        "time" : 1,
    },
    "end-town" : {
        "next" : "end-town",
        "time" : 1,
    },

}

var room_id = process.argv[2];
var game_state = null;
var next_game_state = null;

MafiaDB.findOneAndUpdate({roomid:room_id}, {
    $set: { 'game.state': 'starting'}
}).then((data) => {
    // console.log(data);
    process.send({action : "update_game"});
}).catch(error => {
    console.log(error);
});

class Game {
    constructor(room_id, data) {
        this.game_state = "starting";
        this.room_id = room_id;
        this.data = data;
        this.counter = 0;
    }
}

let game = null;
const roles = ["ranger", "sasquatchEVIL", "camper", "camper", "camper", "hunter", "littlefeetEVIL", "camper", "lumberjack", "bigfeetEVIL"];
// const roles = ["ranger", "littlefeetEVIL", "hunter", "camper", "camper", "hunter", "littlefeetEVIL", "camper", "lumberjack", "bigfeetEVIL"];
let counter = 0;
let total_counter = 900; // total seconds, game terminates if game goes on for too long

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
        
        let role_counter = {
            "hunter" : 2,
            "littlefeetEVIL" : 3,
            "lumberjack" : 3
        }

        MafiaDB.findOneAndUpdate({roomid:room_id}, {
            $set: { game: {
                    evil_players : evil_players,
                    good_players : good_players,
                    roles : role_map,
                    state: "starting"
                },
                role_counter : role_counter
            }
        }).then((data) => {
            // console.log(data);
            process.send({action : "get_roles"});
            counter = 10;
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });
}

async function checkEndGame() {
    MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        // console.log(data)
        let evil_players = data.game.evil_players;
        let good_players = data.game.good_players;
        
        let messages = [];
        let message = { "nickname" : "Game",
                        "player_id" : "1"};
        message["message"] = next_game_state + " " + game.counter;

        if (good_players.length == 0) {
            next_game_state = "end-mafia";
            message["message"] = "Mafia won!"
        } else if (evil_players.length == 0) {
            next_game_state = "end-town";
            message["message"] = "Campers won!"
        }
        messages.push(message)
        console.log(next_game_state)
        if (next_game_state == "night") {
            game.counter++;
        }

        MafiaDB.updateOne({roomid:process.argv[2]}, {
            $set: { 'game.state': next_game_state,
                    'night':new Map()
            },
            $push : { messages : { $each : messages } }
        }).then((data) => {
            // console.log(data);
            process.send({action : "update_game"});
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });
    return;
}

async function checkState() {
    console.log("game state: " + game_state);

    if (game_state == "end" || game_state == "end-mafia" || game_state == "end-town") {
        process.exit(0);
    } 

    // todo make switch statement
    if (game_state == "vote") {
        // count up votes and put player on trial
        let votes = new Map(Object.entries(game.data.votes));
        let vote_counts = new Map();
        // pool up counts
        votes.forEach(function(value, key) {
            if (vote_counts.has(value)) {
                vote_counts.set(value, (vote_counts.get(value) + 1));
            } else {
                vote_counts.set(value, 1);
            }
        });
        let lynch_player = null;
        if (votes.size > 0) {
            console.log(vote_counts)
            let votesDesc = [...vote_counts.entries()].sort((a,b) => b[1] - a[1])
            console.log(votesDesc);
            if (votesDesc.length > 1) {
                if (votesDesc[0][1] > votesDesc[1][1]) {
                    // lynch player
                    console.log("first")
                    lynch_player = votesDesc[0][0];
                } else {
                    // tie vote, no player lynched
                    console.log("second")
                    next_game_state = "after_trial_talk";
                }
            } else {
                // one vote, default lynch player
                console.log("third")
                lynch_player = votesDesc[0][0];
            }
        } else {
            next_game_state = "after_trial_talk";
        }
        // console.log(lynch_player)
        if (lynch_player != null) {
            // place player on trial
            MafiaDB.updateOne({roomid:process.argv[2]},
                {$set:{"trial.trial_player":String(lynch_player),
                    "votes":new Map()}
            }).then((data) => {
                console.log(data)
            }).catch(error => {
                console.log(error);
            });
        } else {
            MafiaDB.updateOne({roomid:process.argv[2]},
                {$set:{"trial.trial_player":"",
                    "votes":new Map()}
            }).then((data) => {
                console.log(data)
            }).catch(error => {
                console.log(error);
            });
        }
            
    }

    if (game_state == "trial") {
        // todo
        // count up guilty vs innocents
        // kill player or save player
        console.log(game.data.trial)

        // todo find player to lynch
        let lynch_player = game.data.trial.trial_player;


        if (lynch_player != null) {
            let trial_votes = new Map(Object.entries(game.data.trial.votes));
            let messages = [];
            let vote_count_guilty = 0
            let vote_count_inno = 0
            game.data.players.forEach((player) => {
                console.log(player)
                if (player.living == true) {
                    let message = { "nickname" : "Game",
                                "player_id" : "0"};
                    if (trial_votes.has(player.player_id)) {
                        if (trial_votes.get(player.player_id) == "guilty") {
                            message["message"] = player.nickname + " voted guilty";
                            vote_count_guilty++;
                        } else if (trial_votes.get(player.player_id) == "inno") {
                            vote_count_inno++;
                            message["message"] = player.nickname + " voted innocent";                        }
                    } else {
                        message["message"] = player.nickname + " abstained"; 
                    }
                    messages.push(message)
                }
            })
            console.log(vote_count_guilty + " " + vote_count_inno)
            console.log(messages);
    
            await MafiaDB.updateOne({roomid:process.argv[2]}, {
                $push : { messages : { $each : messages } },
                $set : {trial : {votes : {}, trial_player: ""}}
            }).exec().catch(error => {
                console.log(error);
            });

            if (vote_count_guilty > vote_count_inno) {
                // lynch player, set dead and delete from list, state their role to chat

                let against_player_info = game.data.players.find(element => element.player_id == lynch_player);
                let message = { "nickname" : "Game",
                                "player_id" : "0"};
                message["message"] = "The camp has lynched " + against_player_info.nickname + ", camper was " + game.data.game.roles[lynch_player]+"!";
                messages = [];
                messages.push(message)

                const living_promise = MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":String(lynch_player)},
                    {$set:{"players.$.living":false}
                }).exec().catch(error => {
                    console.log(error);
                });
                const list_promise = MafiaDB.updateOne({roomid:process.argv[2]},{
                    $pull:{"game.good_players":lynch_player, "game.evil_players":lynch_player},
                    $push : { messages : { $each : messages } }
                }).exec().catch(error => {
                    console.log(error);
                });

                await Promise.all([living_promise, list_promise])
                
            }
        }
    }

    if (game_state == "night") {
        // todo
        // see who used night roles and apply
        // ranger - can investigate
        // camper - can do nothing
        // hunter - can kill a person once
        // lumberjack - can protect
        // sasquatchEVIL - can order kill
        // littlefeetEVIL - can investigate
        // bigfeetEVIL - does the dirty work

        console.log(game.data.night)
        if (game.data.night != undefined) {
            const night_roles = new Map(Object.entries(game.data.night));
            const roles = new Map(Object.entries(game.data.game.roles));

            const role_investigation = {
                "ranger" : " upkeeps the park",
                "sasquatchEVIL" : " is very hairy",
                "camper" : " sing songs and roast marshmellows",
                "hunter" : " has a gun!", 
                "littlefeetEVIL": " is hairy with small feet", 
                "lumberjack" : " chop chop chops", 
                "bigfeetEVIL" : " has massive feet!"
            };

            let dead_reveal_msgs = [];
            await Promise.all(Array.from(night_roles).map(([role, value]) => {
                against_role = roles.get(value.against_id);
                const against_player_info = game.data.players.find(element => element.player_id == value.against_id);

                if (role === 'ranger' || role === 'littlefeetEVIL') {
                    // get against_id players role
                    // send message through secret channel
                    console.log("in ranger");
                    const against_role = roles.get(value.against_id);
                    let message = { "nickname" : "Game",
                                    "player_id" : "0"};
                    
                    message["message"] = against_player_info.nickname + role_investigation[against_role];

                    if (role === 'littlefeetEVIL') {
                        return MafiaDB.updateOne({roomid:process.argv[2]}, {
                            $push: {
                                ["secret." + value.player_id] : message,
                            },
                            $inc: {
                                "role_counter.littlefeetEVIL" : -1
                            }
                        }).exec().catch(error => {
                            console.log(error);
                        });
                    } else {
                        return MafiaDB.updateOne({roomid:process.argv[2]}, {
                            $push: {
                                ["secret." + value.player_id] : message,
                            }
                        }).exec().catch(error => {
                            console.log(error);
                        });
                    }
                } else if (role === 'hunter' || role === 'sasquatchEVIL') {
                    // kill player and remove from alive
                    console.log("hunter: " );

                    let dead_reveal_msg = { "nickname" : "Game",
                                    "player_id" : "0"};
                    dead_reveal_msg["message"] = against_player_info.nickname + "was found dead tonight, camper was " + against_role + "!";
                    dead_reveal_msgs.push(dead_reveal_msg);

                    if (role === 'hunter') {
                        return MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":value.against_id},
                            {$set:{"players.$.living":false},
                            $inc: {
                                "role_counter.hunter" : -1
                            }
                        }).then( (result) => {
                            return MafiaDB.updateOne({roomid:process.argv[2]},{
                                $pull:{"game.good_players":value.against_id, "game.evil_players":value.against_id},
                            }).exec()
                        }).catch(error => {
                            console.log(error);
                        });
                    } else {
                        return MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":value.against_id},
                            {$set:{"players.$.living":false}
                        }).then( (result) => {
                            return MafiaDB.updateOne({roomid:process.argv[2]},{
                                $pull:{"game.good_players":value.against_id, "game.evil_players":value.against_id},
                            }).exec()
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }
            })).then((data) => {
                if (dead_reveal_msgs.length > 0) {
                    MafiaDB.updateOne({roomid:process.argv[2]}, {
                        $push : { messages : { $each : dead_reveal_msgs } }
                    }).exec().catch(error => {
                        console.log(error);
                    });
                }
                console.log("after await")
                console.log(data)
            });

            
        }
        

    }
    return;
}

async function updateGame() {
    console.log("update game")

    // getting game state
    await MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        console.log("first then")
        // console.log(data)
        game.data = data;
        game_state = game.data.game.state;
        next_game_state = next_state[game_state].next;
        counter = next_state[next_game_state].time;

        console.log("end first")
        
        return;
    }).catch(error => {
        console.log(error);
    });

    console.log(next_game_state)

    await checkState();

    await checkEndGame();
}

initGame();

setInterval(() => {
    total_counter = total_counter - 1;
    process.send({ counter: counter-- });
    if (total_counter < 0) {
        process.exit(0);
    }
    if (counter < 0) {
        updateGame();
    }
}, 1000);
