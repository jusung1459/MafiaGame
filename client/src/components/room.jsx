import React, { Component } from 'react'
import socketIO from 'socket.io-client';


class Room extends Component {

    constructor(props) {
        super(props);
        this.socket = socketIO.connect('http://localhost:3000');
    }
    
    componentDidMount() {
        this.socket.on('message', (msg) => console.log(msg));
    }
    
    render() {
        return (
            <div>
                <h1>room</h1>
            </div>
        )
    }
}

export default Room