class GameState {

    static #next_state = {
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

    #game_state;

    constructor(game_state) {
        this.#game_state = game_state;
    }

    getNextState() {
        return this.#game_state[this.#game_state];
    }
}