import React, { Component } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import Chat from './room/chat'
import Players from './room/players';
import Owner from './room/owner';
import Gamestate from './room/gamestate';
import Trial from './room/trial';
import Role from './room/role';

const baseURL = 'http://localhost:3000/api/mafia'

class Room extends Component {

    constructor(props) {
        super(props);
        this.state = {
            token : JSON.parse(localStorage['user'])['token'],
            messages : [],
            game : '',
            players : [],
            owner : '',
            player_id : '',
            time : 0,
            trial : '',
            secret : [],
            dead : [],
            evil_chat : [],
            player_status : new Map(),
        }
        this.socket = socketIO.connect('http://localhost:3000', {
            query: {token : JSON.parse(localStorage['user'])['token']},
        });

        this.updateGameState = this.updateGameState.bind(this);
    }

    updateGameState(gamestate) {
        console.log(gamestate);

        this.setState({
            messages : gamestate.messages,
            game : gamestate.game,
            players : gamestate.players,
            owner : gamestate.owner,
            player_id : gamestate.player_id,
            trial : gamestate.trial,
            votes : gamestate.votes,
            role: gamestate.role,
            secret : gamestate.secret_message,
            dead : gamestate.dead,
            evil_chat : gamestate.evil_chat
        }, () => console.log(this.state));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.secret !== this.state.secret || prevState.dead !== this.state.dead || prevState.evil_chat !== this.state.evil_chat) {

            console.log(this.state.secret != undefined)
            if (((this.state.secret != undefined && this.state.messages != undefined) && this.state.dead != undefined) && this.state.evil_chat != undefined) {
                this.setState({
                    messages : [...this.state.messages, ...this.state.secret, ...this.state.dead, ...this.state.evil_chat].sort((a, b) => {
                        return Date.parse(a.createdAt) - Date.parse(b.createdAt)
                    } ),
                });
                
            }
        }
        if (prevState.players !== this.state.players) {
            console.log(this.state.players)
            const player_status_temp = new Map();
            this.state.players.forEach((player) => {
                player_status_temp.set(player.player_id, player.living);
            });
            console.log(player_status_temp)
            this.setState({
                player_status : player_status_temp
            })
        }
    }
    
    componentDidMount() {

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const params = new URLSearchParams([['token', this.state.token]]);
        
        axios.get(`${baseURL}/gamestate`, {params}, {config}).then((result) => {
            this.updateGameState(result.data.data);
        }) .catch(error => {
            console.log(error);
        });

        this.socket.on('message', (msg) => {
            if (msg.hasOwnProperty('counter')) {
                this.setState({time:msg['counter']});
            }
            console.log(msg)
        });

        this.socket.on('gameUpdate', (msg) => {
            console.log('gameUpdate' + msg);
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
                <h1>room : {JSON.parse(localStorage.getItem('user')).room}</h1>
                <Role role={this.state.role}
                        player_id={this.state.player_id}
                        player_status={this.state.player_status} />
                <Gamestate game={this.state.game}
                            time = {this.state.time}/>
                <Players players={this.state.players} 
                        game={this.state.game}
                        owner={this.state.owner}
                        player_id={this.state.player_id}
                        role={this.state.role}
                        votes={this.state.votes}/>
                <Owner game={this.state.game}
                        owner={this.state.owner}
                        player_id={this.state.player_id}/>
                <Trial game={this.state.game}
                        owner={this.state.owner}
                        player_id={this.state.player_id}
                        trial_player={this.state.trial}
                        players={this.state.players}/>
                <Chat messages={this.state.messages}
                        secret={this.state.secret}
                        dead = {this.state.dead}/>
            </div>
        )
    }
}

export default Room