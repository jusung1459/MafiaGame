import React, { Component } from 'react'
import {withRouter} from '../helper/router';

class StartRoom extends Component {

    constructor(props) {
        super(props);
        this.state = {
            nickname : ""
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
        const room = this.makeid(5);
        const player_id = this.makeid(16);
        this.props.navigate("/room/"+room);
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