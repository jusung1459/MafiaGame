import React, { Component } from 'react'
import {withRouter} from '../helper/router';
import axios from 'axios'

const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'

class StartRoom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            placeholder_nickname : "",
            nickname : "",
            room : ""
        };
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    makeid(length) {
        var result  = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    }

    handleSubmit() {
        if (this.state.nickname.length < 1) {
            this.setState({
                placeholder_nickname : "Enter a non empty nickname",
                room : '',
                nickname : ''
            });
            return;
        }
        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const body = JSON.stringify({ nickname:this.state.nickname });

        const room = this.makeid(5);
        const player_id = this.makeid(16);

        try {
            axios.post(`${baseURL}/create`, body, config).then((result) => {
                const data = result['data'];
                if (data['success'] == true) {
                    delete data['success'];
                    delete data['message'];
                    localStorage.setItem('user', JSON.stringify(data));
                    this.props.navigate("/room/"+data['room']);
                }
            })
            
        } catch (err) {
            this.setState({
                placeholder_room:"Enter 5 character room code",
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
                    <input id="nickname-input" className='home-input'
                        onChange={(evt) => this.setState({nickname : evt.target.value})}
                        maxLength="10"
                        placeholder={this.state.placeholder_nickname}/>
                    <label>Choose a nickname to create a room.</label>
                </div>
                <button className='form-button' onClick={this.handleSubmit} role="button" type="submit">
                    <section className="flex items-center"> Create Room</section>
                </button>
            </div>
        )
    }
}

export default withRouter(StartRoom)