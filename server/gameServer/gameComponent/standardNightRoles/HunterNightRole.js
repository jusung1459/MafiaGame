const AbstractNightRole = require('./AbstractNightRole');
const { DataHandler } = require("../../helpers/DataHandler");

class HunterNightRole extends AbstractNightRole {

    role_msg = " is hairy with small feet";
    message;

    constructor(against_role, against_player_info, room_id, player, game, game_players) {
        super(against_role, against_player_info, room_id);
        this.player = player;
        this.game = game; // this.game.game.
        this.game_players = game_players; // this.game.players
    }


    messageAction() {
        this.message = { "nickname" : "Game",
                            "player_id" : "0"};
                        
        this.message["message"] = this.against_player_info.nickname + " was found dead tonight, camper was " + this.against_role + "!";
        return;
    }

    nightAction() {
        // remove from good_players or evil_players
        console.log("REMOVE PLAYER");
        console.log(this.game);
        let remove_player_index = this.game.good_players.findIndex((player) => {
            console.log(player + " " + this.against_player_info.player_id)
            return player == this.against_player_info.player_id
        })
        if (remove_player_index >= 0) {
            this.game.good_players.splice(remove_player_index, 1);
        } else {
            remove_player_index = this.game.evil_players.findIndex((player) => {
                return player == this.against_player_info.player_id
            })
            if (remove_player_index >= 0) {
                this.game.evil_players.splice(remove_player_index, 1);
            }
        }
        this.game.dead_players.push(this.against_player_info.player_id)

        remove_player_index = this.game_players.findIndex((player) => {
            console.log(player.player_id + " " + this.against_player_info.player_id)
            return player.player_id == this.against_player_info.player_id
        })

        if (remove_player_index >= 0) {
            this.game_players[remove_player_index].living = false
        }
    }

    async executeRole() {
        const set_player_dead = this.dataHandler.addRoomData("$.players", this.game_players);
        const set_game = this.dataHandler.addRoomData('$.game', this.game);
        const add_mesg = this.dataHandler.appendRoomData('$.messages', this.message);
        return Promise.all([set_player_dead, set_game, add_mesg])
    }
    
}

module.exports = HunterNightRole;