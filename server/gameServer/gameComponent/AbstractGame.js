// Abstract Game Class
// Used with template method pattern to inject different game modes

class AbstractGame {

    game_state;

    constructor(room_id, counter, total_counter, day_counter) {
      if (new.target === AbstractGame) {
        throw new TypeError("Cannot construct Abstract instances directly");
      }

      this.room_id = room_id;
      this.counter = counter;
      this.total_counter = total_counter;
      this.day_counter = day_counter;
    }


    async initializeGame() {

    }

    async updateGame() {

    }

    async checkStateGame() {

    }

    async checkEndGame() {

    }

    getNextTime() {
        return this.counter;
    }

    getState() {
        return this.game_state;
    }
    
}

module.exports = AbstractGame;