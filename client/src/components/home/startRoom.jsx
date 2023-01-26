import React, { Component } from 'react'

class StartRoom extends Component {

    makeid(length) {
        var result  = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
       return result;
    }

    createRoom() {
        const room = this.makeid(5);
        const player_id = this.makeid(16);
        
    }

    render() {
        return (
            <div className="startroom">
                <section>
                    <div>
                        <label>Choose a nickname to create a room.</label>
                        <input id="nickname-input"
                            placeholder="Enter your nickname" 
                            maxLength="10"/>
                    </div>
                    <button onClick={this.createRoom} role="button" type="submit">
                        <section className="flex items-center"> Create Room</section>
                    </button>
                </section>
            </div>
        )
    }
}

export default StartRoom