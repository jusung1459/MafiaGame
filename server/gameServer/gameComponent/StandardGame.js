

// Concrete implementation of Game Abstract Class
// Standard Game is default game mode

const { db, redisClient } = require("../helpers/database");
const { Queue } = require('bullmq');
const { DataHandler } = require("../helpers/DataHandler");
const AbstractGame = require('./AbstractGame');

class StandardGame extends AbstractGame {

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
    
    roles = ["ranger", "sasquatchEVIL", "camper", "camper", "camper", "hunter", "littlefeetEVIL", "camper", "lumberjack", "bigfeetEVIL"];

    room_id;
    counter;
    total_counter;
    game;
    game_state;
    next_game_state;
    day_counter;

    constructor(room_id, counter, total_counter, day_counter) {
      super(room_id, counter, total_counter, day_counter);
      this.dataHandler = new DataHandler(room_id);
    }

    async initializeGame() {
        this.dataHandler.getRoomData().then((data) => {
            // console.log(data)
            this.game = data

            // set roles
            let players = this.game.players;
            players = players.sort(() => Math.random() - 0.5);
            let evil_players = [];
            let good_players = [];
            let dead_players = [];
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
                this.game.secret[player.player_id] = [];
            })
            
            const set_game = this.dataHandler.addRoomData('$.game', new_game_state);
            const set_role = this.dataHandler.addRoomData('$.role_counter', role_counter);
            const set_secret = this.dataHandler.addRoomData('$.secret', this.game.secret);

            Promise.all([set_game, set_role, set_secret]).then((data) => {
                // console.log(data);

            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    }

    async updateGame() {
        // getting game state
        await this.dataHandler.getRoomData().then((data) => {
            console.log("first then")
            console.log(data)
            this.game = data;
            this.game_state = this.game.game.state;
            console.log(next_state[this.game_state]);
            this.next_game_state = next_state[this.game_state].next;

            this.counter = next_state[this.next_game_state].time;

            console.log("end first")
            
            return true;
        }).catch(error => {
            console.log(error);
        });

        if (this.game_state === this.next_game_state) {
            return true;
        }

        console.log(this.next_game_state);
    }

    async checkStateGame() {
        if (this.game_state == "end" || this.game_state == "end-mafia" || this.game_state == "end-town") {
            // process.exit(0);
            return;
        } 
    
        if (this.game_state == "vote") {
            // count up votes and put player on trial
            let votes = new Map(Object.entries(this.game.votes));
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
                // console.log(vote_counts)
                let votesDesc = [...vote_counts.entries()].sort((a,b) => b[1] - a[1])
                // console.log(votesDesc);
                if (votesDesc.length > 1) {
                    if (votesDesc[0][1] > votesDesc[1][1]) {
                        // lynch player
                        console.log("first")
                        lynch_player = votesDesc[0][0];
                    } else {
                        // tie vote, no player lynched
                        console.log("second")
                        this.next_game_state = "after_trial_talk";
                    }
                } else {
                    // one vote, default lynch player
                    console.log("third")
                    lynch_player = votesDesc[0][0];
                }
            } else {
                this.next_game_state = "after_trial_talk";
            }
            // console.log(lynch_player)
            if (lynch_player != null) {
                // place player on trial
                const set_trial_player = this.dataHandler.addRoomData('$.trial.trial_player', String(lynch_player));
                const reset_votes = this.dataHandler.addRoomData('$.votes', {});
                Promise.all([set_trial_player, reset_votes]).then((data) => {
                    console.log(data)
                }).catch(error => {
                    console.log(error);
                });
            } else {
                const set_trial_player = this.dataHandler.addRoomData('$.trial.trial_player', "");
                const reset_votes = this.dataHandler.addRoomData('$.votes', {});
                Promise.all([set_trial_player, reset_votes]).then((data) => {
                    console.log(data)
                }).catch(error => {
                    console.log(error);
                });
            }
                
        }
    
        if (this.game_state == "trial") {
            // count up guilty vs innocents
            // kill player or save player
            console.log(this.game.trial)
    
            let lynch_player = this.game.trial.trial_player;
    
    
            if (lynch_player != null) {
                let trial_votes = new Map(Object.entries(this.game.trial.votes));
                let messages = [];
                let vote_count_guilty = 0
                let vote_count_inno = 0
                this.game.players.forEach((player) => {
                    // console.log(player)
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
    
                const add_message = this.dataHandler.appendRoomData('$.messages', ...messages);
                const reset_trial = this.dataHandler.addRoomData('$.trial', {votes: {}, trial_player:""});
    
                await Promise.all([reset_trial, add_message]).catch(error => {
                    console.log(error);
                });
    
                if (vote_count_guilty > vote_count_inno) {
                    // lynch player, set dead and delete from list, state their role to chat
    
                    let against_player_info = this.game.players.find(element => element.player_id == lynch_player);
                    let message = { "nickname" : "Game",
                                    "player_id" : "0",
                                    "createdAt" : new Date()};
                    message["message"] = "The camp has lynched " + against_player_info.nickname + ", camper was " + this.game.game.roles[lynch_player]+"!";
    
                    // remove from good_players or evil_players
                    let remove_player_index = this.game.game.good_players.findIndex((player) => {
                        console.log(player + " " + lynch_player)
                        return player == String(lynch_player)
                    })
                    if (remove_player_index >= 0) {
                        this.game.game.good_players.splice(remove_player_index, 1);
                    } else {
                        remove_player_index = this.game.game.evil_players.findIndex((player) => {
                            return player == String(lynch_player)
                        })
                        if (remove_player_index >= 0) {
                            this.game.game.evil_players.splice(remove_player_index, 1);
                        }
                    }
                    this.game.game.dead_players.push(String(lynch_player))

                    remove_player_index = this.game.players.findIndex((player) => {
                        console.log(player.player_id + " " + lynch_player)
                        return player.player_id == String(lynch_player)
                    })
    
                    if (remove_player_index >= 0) {
                        this.game.players[remove_player_index].living = false
                    }
                    
                    const add_message = this.dataHandler.appendRoomData('$.messages', message);
                    const living_promise = this.dataHandler.addRoomData('$.players', this.game.players);
                    const set_game = this.dataHandler.addRoomData('$.game', this.game.game);
    
                    await Promise.all([add_message, living_promise, set_game])
                    .catch((error) => {
                        console.log(error)
                    })
                    
                }
            }
        }
        if (this.game_state == "night") {
            // todo
            // see who used night roles and apply
            // ranger - can investigate
            // camper - can do nothing
            // hunter - can kill a person once
            // lumberjack - can protect
            // sasquatchEVIL - can order kill
            // littlefeetEVIL - can investigate
            // bigfeetEVIL - does the dirty work
    
            console.log(this.game.night)
            if (this.game.night != undefined) {
                const night_roles = new Map(Object.entries(this.game.night));
                const roles = new Map(Object.entries(this.game.game.roles));
    
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
                    let against_role = roles.get(value.against_id);
                    const against_player_info = this.game.players.find(element => element.player_id == value.against_id);
    
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
                            const dec_role = this.dataHandler.incrData('$.role_counter.littlefeetEVIL');
                            const add_secret_message = this.dataHandler.appendRoomData("$.secret." + value.player_id, message);
                            return Promise.all([dec_role, add_secret_message])
                        } else {
                            return this.dataHandler.appendRoomData("$.secret." + value.player_id, message);
                        }
                    } else if (role === 'hunter' || role === 'sasquatchEVIL') {
                        // kill player and remove from alive
                        console.log("hunter: " );
    
                        let dead_reveal_msg = { "nickname" : "Game",
                                        "player_id" : "0"};
                        dead_reveal_msg["message"] = against_player_info.nickname + " was found dead tonight, camper was " + against_role + "!";
                        dead_reveal_msgs.push(dead_reveal_msg);
    
                        // remove from good_players or evil_players
                        console.log("REMOVE PLAYER");
                        // console.log(this.game);
                        let remove_player_index = this.game.game.good_players.findIndex((player) => {
                            console.log(player + " " + against_player_info.player_id)
                            return player == against_player_info.player_id
                        })
                        if (remove_player_index >= 0) {
                            this.game.game.good_players.splice(remove_player_index, 1);
                        } else {
                            remove_player_index = this.game.game.evil_players.findIndex((player) => {
                                return player == against_player_info.player_id
                            })
                            if (remove_player_index >= 0) {
                                this.game.game.evil_players.splice(remove_player_index, 1);
                            }
                        }
                        this.game.game.dead_players.push(against_player_info.player_id)

                        remove_player_index = this.game.players.findIndex((player) => {
                            console.log(player.player_id + " " + against_player_info.player_id)
                            return player.player_id == against_player_info.player_id
                        })
    
                        if (remove_player_index >= 0) {
                            this.game.players[remove_player_index].living = false
                        }
                        console.log(this.game.players)
                        console.log(remove_player_index)
    
                        if (role === 'hunter') {                        
                            const dec_role = this.dataHandler.incrData('$.role_counter.hunter');
                            const set_player_dead = this.dataHandler.addRoomData("$.players", this.game.players);
                            const set_game = this.dataHandler.addRoomData('$.game', this.game.game);
                            return Promise.all([dec_role, set_player_dead, set_game])
                        } else {
                            const set_player_dead = this.dataHandler.addRoomData("$.players", this.game.players);
                            const set_game = this.dataHandler.addRoomData('$.game', this.game.game);
                            return Promise.all([set_player_dead, set_game])
                        }
                    }
                })).then((data) => {
                    if (dead_reveal_msgs.length > 0) {
                        this.dataHandler.appendRoomData('$.messages', ...dead_reveal_msgs)
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

    async checkEndGame() {
        await this.dataHandler.getRoomData().then((data) => {
            // console.log(data)
            let evil_players = data.game.evil_players;
            let good_players = data.game.good_players;
            
            let message = { "nickname" : "Game",
                            "player_id" : "1",
                            "createdAt" : new Date()};
            // todo game counter
            message["message"] = this.next_game_state + " " + this.day_counter;
    
            if (good_players.length <= 0) {
                this.next_game_state = "end-mafia";
                message["message"] = "Mafia won!"
            } else if (evil_players.length <= 0) {
                this.next_game_state = "end-town";
                message["message"] = "Campers won!"
            }
    
            const add_message = this.dataHandler.appendRoomData('$.messages', message);
            const reset_night = this.dataHandler.addRoomData('$.night', {});
            const change_state = this.dataHandler.addRoomData('$.game.state', this.next_game_state);
    
            Promise.all([add_message, reset_night, change_state]).then((data) => {
                process.send({action : "update_game", room : this.room_id});
            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
        return;
    }
    
}

module.exports = StandardGame;