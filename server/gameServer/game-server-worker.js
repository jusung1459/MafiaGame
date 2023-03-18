const { Queue, Worker } = require('bullmq');
const Room = require('./room');

console.log("worker " + process.env.REDIS_URL);

const roomQueue = new Queue('room', { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
  }});

const roomWorker = new Worker('room', async (job)=>{
  // Optionally report some progress
  console.log(job.data)

  if (job.data.total_tick >= 0) {
    let game_state = undefined;
    if (job.data.tick < 0) {
      let room = new Room(job.data.room, 
                          job.data.tick, 
                          job.data.total_tick,
                          job.data.day_counter);
      await room.update();
      job.data.tick = room.getNextTime();
      game_state = room.getState();
    }

    if (game_state == "end" || game_state === "end-mafia" || game_state === "end-town") {
      return;
    } else {
      if (game_state == "night") {
        roomQueue.add('room', 
                  { room: job.data.room, 
                    tick:(job.data.tick-1), 
                    total_tick:(job.data.total_tick-1),
                    day_counter:job.data.day_counter+1},  
                  { delay: 1000 })
        .then((data) => {
            process.send({ counter: job.data.tick, room:job.data.room});
        });
      } else {
        roomQueue.add('room', 
                    { room: job.data.room, 
                      tick:(job.data.tick-1), 
                      total_tick:(job.data.total_tick-1),
                      day_counter:job.data.day_counter},  
                    { delay: 1000 })
        .then((data) => {
            process.send({ counter: job.data.tick, room:job.data.room});
        });
      }
    }


  }


}, { connection: {
    host: process.env.REDIS_URL,
    port: '6379'
}});