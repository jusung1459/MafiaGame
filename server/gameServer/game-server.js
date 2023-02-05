const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose
    .connect('mongodb://172.18.0.1:27017/mafia', { useNewUrlParser: true })
    .then(() => {
        console.log('successfully connected to the database');
    })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

const MessagesSchema = new Schema({
    message : String,
    nickname : String,
    player_id : String
})

const PlayerSchema = new Schema({
    nickname : String,
    player_id : String
})

const Mafia = new Schema(
    {
        roomid: { type: String, required: true },
        owner: { type: String, required: true },
        game: { 
            evil_players : [String],
            good_players : [String],
            roles : {
                type : Map,
                of : String    
            },
            state : { type: String, required: true }
        },
        players : [PlayerSchema],
        messages : [MessagesSchema]
    },
    { timestamps: true },
)

db.on('error', console.error.bind(console, 'MongoDB connection error:'))

process.on('message', (msg) => {
    console.log('Message from parent:', msg);
});

  
let counter = 0;

let Game = class {
    constructor() {
        this.state = "start";
    }
}

let game = new Game();
  
setInterval(() => {
    process.send({ counter: counter++ });
    if (counter > 30) {
        process.exit(0);
    }
}, 1000);


/*
1. Owner starts room
2. server spins up new process
    - establish rolls 
    - server sends message to players rolls have been created
        - players make GET request for roll
            - server encrypts new roll with token given
            - player decrypts roll.
            - player disconects general room socket
            - player makes new socket again
                - server looks at token and subscribes them to socket room "room_id"+"roll(town/evil)"
    - waits 5seconds
3. Start game

*/