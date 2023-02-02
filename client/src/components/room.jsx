import React, { Component } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import Chat from './room/chat'

const baseURL = 'http://localhost:3000/api/mafia'

class Room extends Component {

    constructor(props) {
        super(props);
        this.state = {
            token : JSON.parse(localStorage['user'])['token'],
            messages : [],
            game : '',
            players : []
        }
        this.socket = socketIO.connect('http://localhost:3000', {
            query: {token : JSON.parse(localStorage['user'])['token']},
        });

        this.updateGameState = this.updateGameState.bind(this);
    }

    updateGameState(gamestate) {
        // this.state.messages = gamestate.messages;
        // this.state.game = gamestate.game;
        // this.state.players = gamestate.players; 
        this.setState({
            messages : gamestate.messages,
            game : gamestate.game,
            players : gamestate.players
        }, () => console.log(this.state));
    }
    
    componentDidMount() {

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const params = new URLSearchParams([['token', this.state.token]]);
        
        console.log(this.state.token)
        axios.get(`${baseURL}/gamestate`, {params}, {config}).then((result) => {
            console.log(result.data.data);
            this.updateGameState(result.data.data);
        }) .catch(error => {
            console.log(error);
        });

        this.socket.on('message', (msg) => console.log(msg));

        this.socket.on('gameUpdate', () => {
            console.log(this.state.token)
            axios.get(`${baseURL}/gamestate`, {params}, {config}).then((result) => {
                console.log(result.data.data);
                this.updateGameState(result.data.data);
            }) .catch(error => {
                console.log(error);
            });
        });
    }
    
    render() {
        return (
            <div>
                <h1>room</h1>
                <Chat messages={this.state.messages}/>
            </div>
        )
    }
}

export default Room