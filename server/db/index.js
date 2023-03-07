const mongoose = require('mongoose')
const redis = require('redis');

mongoose
    .connect('mongodb://172.18.0.1:27017/mafia', { useNewUrlParser: true })
    .then(() => {
        console.log('successfully connected to the database');
    })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

const redisClient = redis.createClient();
redisClient.on('connect', () => {
    console.log('connected to redis');
});

module.exports = {
    db,
    redisClient
} 