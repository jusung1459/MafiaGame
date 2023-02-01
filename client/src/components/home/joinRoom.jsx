import React, { Component } from 'react';
import {withRouter} from '../helper/router';
import axios from 'axios'

const baseURL = 'http://localhost:3000/api/mafia'


class JoinRoom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            room : "",
            nickname : ""
        };
        this.handleSubmit = this.handleSubmit.bind(this)
    }



    handleSubmit() {
        console.log('room: ' + this.state.room + ' nickname: ' + this.state.nickname)
        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        
        const body = JSON.stringify({ 
            nickname:this.state.nickname,
            room_id:this.state.room
        });

        try {
            axios.post(`${baseURL}/join`, body, config).then((result) => {
                console.log(result)
                const data = result['data'];
                if (data['success'] == true) {
                    delete data['success'];
                    delete data['message'];
                    localStorage.setItem('user', JSON.stringify(data));
                    const new_room = "/room/"+this.state.room;
                    this.props.navigate(new_room);
                }
            }).catch(error => {
                console.log(error);
            });
            
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <div className="container">
                <section>
                    <div>
                        <label>Enter the room code</label>
                        <input id="room-input" 
                            onChange={(evt) => this.setState({room : evt.target.value})}
                            placeholder="Enter your room code" 
                            maxLength="5" minLength="5"/>
                    </div>
                    <div>
                        <label>Enter your nickname</label>
                        <input id="nickname-input" 
                            onChange={(evt) => this.setState({nickname : evt.target.value})}
                            placeholder="Enter your nickname" 
                            maxLength="10" minLength="1"/>
                    </div>
                </section>
                <button onClick={this.handleSubmit} role="button" type="submit">
                    <section className="flex items-center"> Join Room</section>
                </button>
            </div>
        )
    }
}

export default withRouter(JoinRoom)