import React, { Component } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'

const baseURL = 'http://localhost:3000/api/mafia'

class Chat extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return(
            <div>chat</div>
        );
    }

}

export default Chat;
