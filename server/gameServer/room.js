const { db, redisClient } = require("./helpers/database");
const { Queue } = require('bullmq');
const { DataHandler } = require("./helpers/DataHandler");
const StandardGame = require("./gameComponent/StandardGame");

class Room {
    game;

    constructor(room_id, counter, total_counter, day_counter) {
        this.game = new StandardGame(room_id, counter, total_counter, day_counter);
    }

    async initGame() {
        this.game.initializeGame();
    }

    async update() {
        try {
            await this.game.updateGame();
        } catch (err) {
            console.log("update game error")
            console.log(err);
        }

        try {
            await this.game.checkStateGame();
        } catch (err) {
            console.log("check state game error")
            console.log(err);
        }

        try {
            await this.game.checkEndGame();
        } catch (err) {
            console.log("check end game error")
            console.log(err)
        }
    }

    getNextTime() {
        return this.game.getNextTime();
    }

    getState() {
        return this.game.getState();
    }
}

module.exports = Room