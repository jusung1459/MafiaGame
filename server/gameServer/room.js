const { db, redisClient } = require("./helpers/database");
const { Queue } = require('bullmq');

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

const next_state = {
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

const roles = ["ranger", "sasquatchEVIL", "camper", "camper", "camper", "hunter", "littlefeetEVIL", "camper", "lumberjack", "bigfeetEVIL"];


class Room {
    room_id;
    counter;
    total_counter;
    game;

    constructor(room_id, counter, total_counter) {
        this.room_id = room_id;
        this.counter = counter;
        this.total_counter = total_counter;
    }

    async initGame() {
        // getting game state

        console.log(this.room_id)
        redisClient.json.get(`mafia:${this.room_id}`).then((data) => {
            // console.log(data)
            this.game = data

            // set roles
            let players = this.game.players;
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
                this.game.secret[player.player_id] = [];
            })
            

            const set_game = redisClient.json.set(`mafia:${this.room_id}`, '$.game', new_game_state);
            const set_role = redisClient.json.set(`mafia:${this.room_id}`, '$.role_counter', role_counter);
            const set_secret = redisClient.json.set(`mafia:${this.room_id}`, '$.secret', this.game.secret);

            Promise.all([set_game, set_role, set_secret]).then((data) => {
                // console.log(data);
                

            }).catch(error => {
                console.log(error);
            });
        }).catch(error => {
            console.log(error);
        });
    }
}

module.exports = Room