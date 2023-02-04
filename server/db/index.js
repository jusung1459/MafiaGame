const mongoose = require('mongoose')

mongoose
    .connect('mongodb://172.21.0.1:27017/mafia', { useNewUrlParser: true })
    .then(() => {
        console.log('successfully connected to the database');
    })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db