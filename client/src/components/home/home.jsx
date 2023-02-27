import React, { Component } from 'react'

import StartRoom from './startRoom'
import JoinRoom from './joinRoom'

class Home extends Component {

    render() {
        return (
            <main className='main'>
                <div className='box'>
                    <div className='form-box'>
                        <h2>Welcome to camp mafia game</h2>
                        <h3>Create a room</h3>
                        <StartRoom />
                        <h3>Join a room</h3>
                        <JoinRoom />
                    </div>
                </div>
            </main>
        )
    }
}

export default Home