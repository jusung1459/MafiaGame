const mongoose = require('mongoose')
const redis = require('redis');

mongoose
    .connect('mongodb://172.19.0.1:27017/mafia', { useNewUrlParser: true })
    .then(() => {
        console.log('successfully connected to the database');
    })
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

connectRedis = async () => {
    await redisClient.connect();
}

const redisClient = redis.createClient({
    socket: {
        host: '172.19.0.1',
        port: '6379'
    }
});
redisClient.on('connect', () => {
    console.log('connected to redis');
});

connectRedis();


module.exports = {
    db,
    redisClient
} 