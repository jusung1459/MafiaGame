// Abstract Night Role Class
// Used to represent what a Role should do at night

const { DataHandler } = require("../../helpers/DataHandler");

class AbstractNightRole {

    constructor(against_role, against_player_info, room_id) {
      if (new.target === AbstractNightRole) {
        throw new TypeError("Cannot construct Abstract instances directly");
      }

      this.against_role = against_role;
      this.against_player_info = against_player_info;
      this.dataHandler = new DataHandler(room_id);
    }


    messageAction() {

    }

    nightAction() {

    }

    async executeRole() {

    }
    
}

module.exports = AbstractNightRole;