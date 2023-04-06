const { db, redisClient } = require("./database");

class DataHandler {
    #room_id;

    constructor(redisClient, room_id) {
        this.#room_id = room_id;
    }

    async getRoomData() {
        return redisClient.json.get(`mafia:${this.room_id}`);
    }

    async setRoomData() {
        
    }
}