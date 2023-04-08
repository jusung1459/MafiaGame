const { db, redisClient } = require("./database");

class DataHandler {
    #room_id;

    constructor(room_id) {
        this.#room_id = room_id;
    }

    async getRoomData() {
        return redisClient.json.get(`mafia:${this.#room_id}`);
    }

    async addRoomData(path, new_data) {
        return redisClient.json.set(`mafia:${this.#room_id}`, path, new_data);
    }

    async appendRoomData(path, new_data) {
        return redisClient.json.arrAppend(`mafia:${this.#room_id}`, path, new_data);
    }

    async decrData(path) {
        return redisClient.json.numIncrBy(`mafia:${this.#room_id}`, path, -1);
    }

    async incrData(path) {
        return redisClient.json.numIncrBy(`mafia:${this.#room_id}`, path, 1);
    }
}

module.exports = {DataHandler};