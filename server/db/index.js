const mongoose = require('mongoose')
const redis = require('redis');

mongoose
    .connect('mongodb://'+ process.env.MONGO_URL + ':27017/mafia', { useNewUrlParser: true })
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
        host: process.env.REDIS_URL,
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