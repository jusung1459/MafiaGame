const { Queue, Worker } = require('bullmq')

console.log("worker " + process.env.REDIS_URL);

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

const roomWorker = new Worker('room', async (job)=>{
  // Optionally report some progress
  console.log(job.data)

  if (job.data.total_tick >= 0) {
    if (job.data.tick < 0) {

    } else {
      roomQueue.add('room', 
                  { room: job.data.room, tick:(job.data.tick-1), total_tick:(job.data.total_tick-1)},  
                  { delay: 1000 })
      .then((data) => {
          process.send({ counter: job.data.tick, room:job.data.room});
      });
    }

  }


}, { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
}});