// Abstract Night Role Class
// Used to represent what a Role should do at night

class AbstractNightRole {

    constructor() {
      if (new.target === AbstractNightRole) {
        throw new TypeError("Cannot construct Abstract instances directly");
      }
    }


    message() {

    }

    nightAction() {

    }
    
}

module.exports = AbstractNightRole;