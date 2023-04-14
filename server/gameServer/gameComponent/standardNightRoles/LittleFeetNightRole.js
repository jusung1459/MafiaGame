const AbstractNightRole = require('./AbstractNightRole');
const { DataHandler } = require("../../helpers/DataHandler");

class LittleFeetNightRole extends AbstractNightRole {

    role_msg = " is hairy with small feet";
    message;

    constructor(against_role, against_player_info, room_id, player) {
        super(against_role, against_player_info, room_id);
        this.player = player;
    }


    messageAction() {
        this.message = { "nickname" : "Game",
                        "player_id" : "0",
                        "createdAt" : new Date()};
                        
        this.message["message"] = this.against_player_info.nickname + this.role_msg;
        return;
    }

    nightAction() {
        return;
    }

    async executeRole() {
        const dec_role = this.dataHandler.incrData('$.role_counter.littlefeetEVIL');
        const add_secret_message = this.dataHandler.appendRoomData("$.secret." + this.player.player_id, this.message);
        return Promise.all([dec_role, add_secret_message]);
    }
    
}

module.exports = LittleFeetNightRole;