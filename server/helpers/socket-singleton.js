const jwt = require('jsonwebtoken');

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

        // authenticate JWT in initial connection
        io.use((socket, next) => {
            // console.log(socket.handshake.query.token)
            if (socket.handshake.query && socket.handshake.query.token) {
                jwt.verify(socket.handshake.query.token, process.env.JWT_KEY, (err, decoded) => {
                    if (err) {
                        console.log(err);
                        return next(new Error("Authentication error"));
                    }
                    // console.log(decoded['room']);
                    socket.decoded = decoded;
                    next();
                });
            }
        });

        io.on('connection', (socket) => {
            this._socket = socket;
            console.log(this._socket.decoded['room']);
            socket.join(this._socket.decoded['room'])
            socket.emit("message", "hello");
            console.log("User connect: " + socket.id);
        });
    }

    sendEvent(event, data) {
        this._socket.to(this._socket.decoded['room']).emit(event, data);
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