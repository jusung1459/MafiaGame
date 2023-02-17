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
            of : MessagesSchema
        },
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

let room_id = process.argv[2];

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
    }
}

let game = null;
const roles = ["ranger", "sasquatchEVIL", "camper", "camper", "camper", "hunter", "littlefeetEVIL", "camper", "lumberjack", "bigfeetEVIL"];
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
                    state: "starting"
                }
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

async function checkEndGame(next_game_state) {
    MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        console.log("inside 2nd then")
        // console.log(data)
        let evil_players = data.game.evil_players;
        let good_players = data.game.good_players;
        console.log(evil_players);
        console.log(good_players);
        console.log(good_players.length == 0)
        console.log(evil_players.length == 0)
        if (good_players.length == 0) {
            next_game_state = "end-mafia";
        } else if (evil_players.length == 0) {
            next_game_state = "end-town";
        }
        console.log(next_game_state)

        MafiaDB.updateOne({roomid:process.argv[2]}, {
            $set: { 'game.state': next_game_state,
                    'night':new Map()
            }
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

async function updateGame() {
    var game_state = null;
    var next_game_state = null;

    // getting game state
    MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
        console.log("first then")
        // console.log(data)
        game.data = data;
        game_state = game.data.game.state;
        next_game_state = next_state[game_state].next;
        counter = next_state[next_game_state].time;

        console.log("game state: " + game_state);

        if (game_state == "end" || game_state == "end-mafia" || game_state == "end-town") {
            process.exit(0);
        } 

        // todo make switch statement
        if (game_state == "vote") {
            // count up votes and put player on trial
            let votes = new Map(Object.entries(data.votes));
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
        
                MafiaDB.updateOne({roomid:process.argv[2]}, {
                    $push : { messages : { $each : messages } },
                    $set : {trial : {votes : {}, trial_player: ""}}
                }).then((data) => {
                    console.log("trial messages");
                    // process.send({action : "update_game"});
                }).catch(error => {
                    console.log(error);
                });

                if (vote_count_guilty > vote_count_inno) {
                    // lynch player, set dead and delete from list
                    MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":String(lynch_player)},
                        {$set:{"players.$.living":false}
                    }).then((data)=> {
                        return;
                    }).catch(error => {
                        console.log(error);
                    });
                    MafiaDB.updateOne({roomid:process.argv[2]},{
                        $pull:{"game.good_players":lynch_player, "game.evil_players":lynch_player},
                    }).catch(error => {
                        console.log(error);
                    });
                    // process.send({action : "update_game"});
                    
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

                night_roles.forEach((value, role) => {
                    console.log(role);
                    console.log(value);
                    against_role = roles.get(value.against_id);
                    const against_player_info = game.data.players.find(element => element.player_id == value.against_id);
                    console.log(roles);
                    console.log(against_player_info)
                    if (role === 'ranger' || role === 'littlefeetEVIL') {
                        // get against_id players role
                        // send message through secret channel
                        console.log("in ranger");
                        const against_role = roles.get(value.against_id);
                        let message = { "nickname" : "Game",
                                        "player_id" : "0"};
                        
                        message["message"] = against_player_info.nickname + role_investigation[against_role];
    
                        MafiaDB.updateOne({roomid:process.argv[2]}, {
                            $push: {
                                ["secret." + value.player_id] : message,
                            }
                        }).then(data => {
                            console.log("night then " + "secret." + value.player_id)
                            console.log(data);
                        }).catch(error => {
                            console.log(error);
                        });
                    } else if (role === 'hunter' || role === 'sasquatchEVIL') {
                        // kill player and remove from alive
                        MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":String(value.against_id)},
                            {$set:{"players.$.living":false}
                        }).catch(error => {
                            console.log(error);
                        });
                        MafiaDB.updateOne({roomid:process.argv[2]},{
                            $pull:{"game.good_players":value.against_id, "game.evil_players":value.against_id},
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                });
            }
            

        }

        console.log("end first")
        
        return;
    }).then(() => {
        console.log("2nd then")
        MafiaDB.findOne({roomid:process.argv[2]}).lean().then((data) => {
            console.log("inside 2nd then")
            // console.log(data)
            let evil_players = data.game.evil_players;
            let good_players = data.game.good_players;
            console.log(evil_players);
            console.log(good_players);
            console.log(good_players.length == 0)
            console.log(evil_players.length == 0)
            if (good_players.length == 0) {
                next_game_state = "end-mafia";
            } else if (evil_players.length == 0) {
                next_game_state = "end-town";
            }
            console.log(next_game_state)

            MafiaDB.updateOne({roomid:process.argv[2]}, {
                $set: { 'game.state': next_game_state,
                        'night':new Map()
                }
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

    }).catch(error => {
        console.log(error);
    });
}

initGame();

setInterval(() => {
    process.send({ counter: counter-- });
    if (counter < 0) {
        updateGame();
    }
    if (counter < -1) {
        process.send({action : "update_game"});
    }
}, 1000);
