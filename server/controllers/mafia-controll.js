const Mafia = require('../models/mafia-model')

createRoom = (req, res) => {
    var body = req.body
    console.log("post create room")

    if (!body) {
        return res.status(400).json({
            success:false,
            error: 'No room'
        })
    }
    console.log(body)

    const mafia = new Mafia(body)
    
    if (!mafia) {
        return res.status(400).json({ success: false, error: err })
    }
    mafia.markModified("mafia")
    mafia.save().then(() => {
        return res.status(201).json({
            success: true,
            id: mafia._id,
            message: 'room created',
        })
    }).catch(error => {
        return res.status(400).json({
            error,
            message: 'Room not created',
        })
    })
}

getRoom = (req, res) => {
    return res.send("hello!")
}

module.exports = {
    createRoom, 
    getRoom,
}