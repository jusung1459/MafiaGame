process.on('message', (msg) => {
    console.log('Message from parent:', msg);
});

process.on('start')
  
let counter = 0;

const Game = class {
    constructor() {
        this.state = "start";
    }
}

let game = Game();
  
setInterval(() => {
    process.send({ counter: counter++ });
    if (counter === 30) {
        process.exit(0);
    }
}, 1000);


/*
1. Owner starts room
2. server spins up new process
    - establish rolls 
    - server sends message to players rolls have been created
        - players make GET request for roll
            - server encrypts new roll with token given
            - player decrypts roll.
            - player disconects general room socket
            - player makes new socket again
                - server looks at token and subscribes them to socket room "room_id"+"roll(town/evil)"
    - waits 5seconds
3. Start game

*/