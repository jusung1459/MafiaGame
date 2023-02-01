import React, { Component } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'

const baseURL = 'http://localhost:3000/api/mafia'

class Room extends Component {

    constructor(props) {
        super(props);
        this.state = {
            token : JSON.parse(localStorage['user'])['token']
        }
        this.socket = socketIO.connect('http://localhost:3000', {
            query: {token : JSON.parse(localStorage['user'])['token']},
        });
    }
    
    componentDidMount() {

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const params = new URLSearchParams([['token', this.state.token]]);
        
        console.log(this.state.token)
        axios.get(`${baseURL}/gamestate`, {params}, {config}).then((result) => {
            console.log(result.data.data);
        }) .catch(error => {

        });

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