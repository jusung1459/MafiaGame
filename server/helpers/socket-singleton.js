let connection = null;

// singleton class for socket io
class SocketConnection {
    constructor()  {
        this._socket = null;
    }

    connect(server) {
        const io = require('socket.io')(server, {
            cors: {
              origin: "http://localhost:8000",
              methods: ["GET", "POST"]
            }
          });

        io.on('connection', (socket) => {
            this._socket = socket;
            socket.emit("message", "hello");
            console.log("User connect: " + socket.id);
        });
    }

    sendEvent(event, data) {
        this._socket.emit(event, data);
    }

    registerEvent(event, handler) {
        this._socket.on(event, handler);
    }

    static init(server) {
        if(!connection) {
            connection = new SocketConnection();
            connection.connect(server);
        }
    }

    static getConnection() {
        if(!connection) {
            throw new Error("no active connection");
        }
        return connection;
    }
}

module.exports = {
    connect: SocketConnection.init,
    connection: SocketConnection.getConnection 
}

// https://stackoverflow.com/questions/49980164/how-can-i-share-socket-io-into-other-modules-in-nodejs