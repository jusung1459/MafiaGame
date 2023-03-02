import React, { Component } from 'react';
import {withRouter} from '../helper/router';
import axios from 'axios'

const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'


class JoinRoom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            room : "",
            nickname : "",
            placeholder_room : "",
            placeholder_nickname : ""
        };
        this.handleSubmit = this.handleSubmit.bind(this)
    }



    handleSubmit() {
        console.log('room: ' + this.state.room + ' nickname: ' + this.state.nickname)
        
        if (this.state.nickname.length < 1 || this.state.room.length != 5)  {
            this.setState({
                placeholder_room:"Enter 5 character room code",
                placeholder_nickname : "Enter a non empty nickname",
                room : '',
                nickname : ''
            });
            
            return;
        
        }

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
                this.setState({
                    placeholder_room:"Enter 5 character room code",
                    placeholder_nickname : "Enter a nickname",
                    room : '',
                    nickname : ''
                });
            });
            
        } catch (err) {
            this.setState({
                placeholder_room:"Enter valid 5 character room code",
                placeholder_nickname : "Enter a nickname",
                room : '',
                nickname : ''
            });
        }
    }

    render() {
        return (
            <div className='sub-box'>
                <div className='input-box'>
                    <input id="room-input"  className='home-input'
                        onChange={(evt) => this.setState({room : evt.target.value})}
                        maxLength="5" minLength="5"
                        value={this.state.room}
                        placeholder={this.state.placeholder_room}/>
                    <label>Enter the room code</label>
                </div>
                <div className='input-box'>
                    <input id="nickname-input" className='home-input' 
                        onChange={(evt) => this.setState({nickname : evt.target.value})}
                        value={this.state.nickname}
                        maxLength="10" minLength="1"
                        placeholder={this.state.placeholder_nickname}/>
                    <label>Enter your nickname</label>
                </div>
                <button className='form-button' onClick={this.handleSubmit} role="button" type="submit">
                    <section className="flex items-center"> Join Room</section>
                </button>
            </div>
        )
    }
}

export default withRouter(JoinRoom)