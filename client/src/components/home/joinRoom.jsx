import React, { Component, useState } from 'react';

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
    }

    render() {
        return (
            <div className="join-room">
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

export default JoinRoom