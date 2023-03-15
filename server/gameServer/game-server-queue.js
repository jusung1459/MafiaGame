const { Queue, Worker } = require('bullmq')

console.log("worker " + process.env.REDIS_URL);

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

const roomWorker = new Worker('room', async (job)=>{
  // Optionally report some progress
  console.log(job.data)
  console.log("job done")

  if (job.data.tick < 30) {
    await roomQueue.add('room', { room: job.data.room, tick:(job.data.tick+1) },  { delay: 1000 }).then((data) => console.log(data.data));

  }


}, { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
}});