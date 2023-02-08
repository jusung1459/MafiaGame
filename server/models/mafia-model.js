const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessagesSchema = new Schema({
    message : String,
    nickname : String,
    player_id : String
})

const PlayerSchema = new Schema({
    nickname : String,
    player_id : String,
    living : Boolean,
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
        votes : {
            type : Map,
            of : String    
        },
        trial : {
            trial_player : String,
            votes : {
                type : Map,
                of : String  
            }  
        },
        messages : [MessagesSchema]
    },
    { timestamps: true },
)

module.exports = mongoose.model('mafia', Mafia)