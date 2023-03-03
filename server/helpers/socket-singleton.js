const jwt = require('jsonwebtoken');

let connection = null;
let io = null

// singleton class for socket io
class SocketConnection {
    constructor()  {
        this._socket = null;
    }

    connect(server) {
        io = require('socket.io')(server, {
            cors: {
              origin: 'http://' + process.env.URL_ADDRESS + ':8000',
              methods: ["GET", "POST"]
            }
        });

        // authenticate JWT in initial connection
        io.eio.pingTimeout = 120000;
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
            socket.join(socket.decoded['room'])
            io.emit("message", "connected");

            socket.on("disconnect", (reason) => {
                console.log(reason);
            });
        });
    }

    sendEvent(event, data, room) {
        io.in(room).emit(event, data);
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