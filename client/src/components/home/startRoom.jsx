import React, { Component } from 'react'
import {withRouter} from '../helper/router';
import axios from 'axios'

const baseURL = 'http://localhost:3000/api/mafia'

class StartRoom extends Component {

    constructor(props) {
        super(props);
        this.state = {
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
            console.log(err);
        }
    }

    render() {
        return (
            <div className="container">
                <section>
                    <div>
                        <label>Choose a nickname to create a room.</label>
                        <input id="nickname-input"
                            onChange={(evt) => this.setState({nickname : evt.target.value})}
                            placeholder="Enter your nickname" 
                            maxLength="10"/>
                    </div>
                    <button onClick={this.handleSubmit} role="button" type="submit">
                        <section className="flex items-center"> Create Room</section>
                    </button>
                </section>
            </div>
        )
    }
}

export default withRouter(StartRoom)