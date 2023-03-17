const { db, redisClient } = require("./helpers/database")
// const MafiaDB = require('./helpers/mafia-model')

// process.on('message', (msg) => {
//     console.log('Message from parent:', msg);
// });

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

async function initGame() {
    // getting game state

    redisClient.json.get(`mafia:${room_id}`).then((data) => {
        console.log("init Game")
        // console.log(data)
        game = new Game(room_id, data);

        // set roles
        let players = game.data.players;
        players = players.sort(() => Math.random() - 0.5);
        let evil_players = [];
        let good_players = [];
        let dead_players = []
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

        let new_game_state = {
            state: "starting",
            evil_players: evil_players,
            good_players: good_players,
            dead_players: dead_players,
            roles: Object.fromEntries(role_map),
        }
        // set secret message channel for each player
        players.forEach((player) => {
            game.data.secret[player.player_id] = [];
        })
        

        const set_game = redisClient.json.set(`mafia:${room_id}`, '$.game', new_game_state);
        const set_role = redisClient.json.set(`mafia:${room_id}`, '$.role_counter', role_counter);
        const set_secret = redisClient.json.set(`mafia:${room_id}`, '$.secret', game.data.secret);

        Promise.all([set_game, set_role, set_secret]).then((data) => {
            // console.log(data);
            process.send({action : "update_game"});
            counter = 10;
        }).catch(error => {
            console.log(error);
        });
    }).catch(error => {
        console.log(error);
    });
}

async function checkEndGame() {
    redisClient.json.get(`mafia:${process.argv[2]}`).then((data) => {
        // console.log(data)
        let evil_players = data.game.evil_players;
        let good_players = data.game.good_players;
        
        let message = { "nickname" : "Game",
                        "player_id" : "1",
                        "createdAt" : new Date()};
        message["message"] = next_game_state + " " + game.counter;

        if (good_players.length == 0) {
            next_game_state = "end-mafia";
            message["message"] = "Mafia won!"
        } else if (evil_players.length == 0) {
            next_game_state = "end-town";
            message["message"] = "Campers won!"
        }
        console.log(next_game_state)
        if (next_game_state == "night") {
            game.counter++;
        }

        const add_message = redisClient.json.arrAppend(`mafia:${room_id}`, '$.messages', message);
        const reset_night = redisClient.json.set(`mafia:${room_id}`, '$.night', {});
        const change_state = redisClient.json.set(`mafia:${room_id}`, '$.game.state', next_game_state);

        Promise.all([add_message, reset_night, change_state]).then((data) => {
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
            const set_trial_player = redisClient.json.set(`mafia:${room_id}`, '$.trial.trial_player', String(lynch_player));
            const reset_votes = redisClient.json.set(`mafia:${room_id}`, '$.votes', {});
            Promise.all([set_trial_player, reset_votes]).then((data) => {
                console.log(data)
            }).catch(error => {
                console.log(error);
            });
        } else {
            const set_trial_player = redisClient.json.set(`mafia:${room_id}`, '$.trial.trial_player', "");
            const reset_votes = redisClient.json.set(`mafia:${room_id}`, '$.votes', {});
            Promise.all([set_trial_player, reset_votes]).then((data) => {
                console.log(data)
            }).catch(error => {
                console.log(error);
            });
        }
            
    }

    if (game_state == "trial") {
        // count up guilty vs innocents
        // kill player or save player
        console.log(game.data.trial)

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
                                "player_id" : "0",
                                "createdAt" : new Date()};
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

            const add_message = redisClient.json.arrAppend(`mafia:${room_id}`, '$.messages', ...messages);
            const reset_trial = redisClient.json.set(`mafia:${room_id}`, '$.trial', {votes: {}, trial_player:""});

            await Promise.all([reset_trial, add_message]).catch(error => {
                console.log(error);
            });

            if (vote_count_guilty > vote_count_inno) {
                // lynch player, set dead and delete from list, state their role to chat

                let against_player_info = game.data.players.find(element => element.player_id == lynch_player);
                let message = { "nickname" : "Game",
                                "player_id" : "0",
                                "createdAt" : new Date()};
                message["message"] = "The camp has lynched " + against_player_info.nickname + ", camper was " + game.data.game.roles[lynch_player]+"!";

                // remove from good_players or evil_players
                let remove_player_index = game.data.game.good_players.findIndex((player) => {
                    console.log(player + " " + lynch_player)
                    return player == String(lynch_player)
                })
                if (remove_player_index >= 0) {
                    game.data.game.good_players.splice(remove_player_index, 1);
                } else {
                    remove_player_index = game.data.game.evil_players.findIndex((player) => {
                        return player == String(lynch_player)
                    })
                    if (remove_player_index >= 0) {
                        game.data.game.evil_players.splice(remove_player_index, 1);
                    }
                }
                game.data.game.dead_players.push(String(lynch_player))

                if (remove_player_index >= 0) {
                    game.data.players[remove_player_index].living = false
                }
                console.log(game.data.players)
                console.log(remove_player_index)
                
                console.log(game.data.game)
                const add_message = redisClient.json.arrAppend(`mafia:${room_id}`, '$.messages', message);
                // const add_dead_player = redisClient.json.arrAppend(`mafia:${room_id}`, '$.game.dead_players', String(lynch_player));
                const living_promise = redisClient.json.set(`mafia:${room_id}`, '$.players', game.data.players);
                const set_game = redisClient.json.set(`mafia:${room_id}`, '$.game', game.data.game);

                // const living_promise = MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":String(lynch_player)},
                //     {$set:{"players.$.living":false}
                // }).exec().catch(error => {
                //     console.log(error);
                // });
                // const list_promise = MafiaDB.updateOne({roomid:process.argv[2]},{
                //     $pull:{"game.good_players":lynch_player, "game.evil_players":lynch_player},
                //     $push : { messages : { $each : messages },
                //              "game.dead_players":lynch_player}
                // }).exec().catch(error => {
                //     console.log(error);
                // });

                await Promise.all([add_message, living_promise, set_game])
                .catch((error) => {
                    console.log(error)
                })
                
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
                                    "player_id" : "0",
                                    "createdAt" : new Date()};
                    
                    message["message"] = against_player_info.nickname + role_investigation[against_role];

                    if (role === 'littlefeetEVIL') {
                        const dec_role = redisClient.json.numIncrBy(`mafia:${process.argv[2]}`, '$.role_counter.littlefeetEVIL', -1);
                        const add_secret_message = redisClient.json.arrAppend(`mafia:${process.argv[2]}`, "$.secret." + value.player_id, message);
                        return Promise.all([dec_role, add_secret_message])
                    } else {
                        return redisClient.json.arrAppend(`mafia:${process.argv[2]}`, "$.secret." + value.player_id, message);
                    }
                } else if (role === 'hunter' || role === 'sasquatchEVIL') {
                    // kill player and remove from alive
                    console.log("hunter: " );

                    let dead_reveal_msg = { "nickname" : "Game",
                                    "player_id" : "0"};
                    dead_reveal_msg["message"] = against_player_info.nickname + " was found dead tonight, camper was " + against_role + "!";
                    dead_reveal_msgs.push(dead_reveal_msg);

                    // remove from good_players or evil_players
                    let remove_player_index = game.data.game.good_players.findIndex((player) => {
                        console.log(player + " " + against_player_info.player_id)
                        return player == against_player_info.player_id
                    })
                    if (remove_player_index >= 0) {
                        game.data.game.good_players.splice(remove_player_index, 1);
                    } else {
                        remove_player_index = game.data.game.evil_players.findIndex((player) => {
                            return player == against_player_info.player_id
                        })
                        if (remove_player_index >= 0) {
                            game.data.game.evil_players.splice(remove_player_index, 1);
                        }
                    }
                    game.data.game.dead_players.push(against_player_info.player_id)

                    if (remove_player_index >= 0) {
                        game.data.players[remove_player_index].living = false
                    }
                    console.log(game.data.players)
                    console.log(remove_player_index)

        //     const add_message = redisClient.json.arrAppend(`mafia:${room_id}`, '$.messages', message);
        // // const add_dead_player = redisClient.json.arrAppend(`mafia:${room_id}`, '$.game.dead_players', String(lynch_player));
        // const living_promise = redisClient.json.set(`mafia:${room_id}`, '$.players', game.data.players);
        // const set_game = redisClient.json.set(`mafia:${room_id}`, '$.game', game.data.game);

                    if (role === 'hunter') {                        
                        const dec_role = redisClient.json.numIncrBy(`mafia:${process.argv[2]}`, '$.role_counter.hunter', -1);
                        const set_player_dead = redisClient.json.set(`mafia:${process.argv[2]}`, "$.players", game.data.players);
                        const set_game = redisClient.json.set(`mafia:${process.argv[2]}`, '$.game', game.data.game);
                        return Promise.all([dec_role, set_player_dead, set_game])
                        // return MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":value.against_id},
                        //     {$set:{"players.$.living":false},
                        //     $inc: {
                        //         "role_counter.hunter" : -1
                        //     }
                        // }).then( (result) => {
                        //     return MafiaDB.updateOne({roomid:process.argv[2]},{
                        //         $pull:{"game.good_players":value.against_id, "game.evil_players":value.against_id},
                        //         $push : { "game.dead_players":value.against_id}
                        //     }).exec()
                        // }).catch(error => {
                        //     console.log(error);
                        // });
                    } else {
                        const set_player_dead = redisClient.json.set(`mafia:${process.argv[2]}`, "$.players", game.data.players);
                        const set_game = redisClient.json.set(`mafia:${process.argv[2]}`, '$.game', game.data.game);
                        return Promise.all([set_player_dead, set_game])
                        // return MafiaDB.updateOne({roomid:process.argv[2], "players.player_id":value.against_id},
                        //     {$set:{"players.$.living":false}
                        // }).then( (result) => {
                        //     return MafiaDB.updateOne({roomid:process.argv[2]},{
                        //         $pull:{"game.good_players":value.against_id, "game.evil_players":value.against_id},
                        //         $push : { "game.dead_players":value.against_id}
                        //     }).exec()
                        // }).catch(error => {
                        //     console.log(error);
                        // });
                    }
                }
            })).then((data) => {
                if (dead_reveal_msgs.length > 0) {
                    redisClient.json.arrAppend(`mafia:${process.argv[2]}`, '$.messages', ...dead_reveal_msgs)
                    .catch(error => {
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
    await redisClient.json.get(`mafia:${room_id}`).then((data) => {
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

    try {
        await checkState();
    } catch (err) {
        console.log(err);
    }

    try {
        await checkEndGame();
    } catch (err) {
        console.log(err)
    }
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
