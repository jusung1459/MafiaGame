const AbstractNightRole = require('./AbstractNightRole');
const { DataHandler } = require("../../helpers/DataHandler");

class RangerNightRole extends AbstractNightRole {

    role_msg = " upkeeps the park";
    message;

    constructor(against_role, against_player_info, room_id, player) {
        super(against_role, against_player_info, room_id);
        this.player = player.player_id;
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
        console.log(this.message);
        console.log(this.player);
        return this.dataHandler.appendRoomData("$.secret." + this.player, this.message);
    }
    
}

module.exports = RangerNightRole;