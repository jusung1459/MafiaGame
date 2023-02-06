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

const VotesSchema = new Schema({
    from_id : String,
    to_id : String
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
        votes : [VotesSchema],
        messages : [MessagesSchema]
    },
    { timestamps: true },
)

module.exports = mongoose.model('mafia', Mafia)