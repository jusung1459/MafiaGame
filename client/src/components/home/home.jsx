import React, { Component } from 'react'

import StartRoom from './startRoom'
import JoinRoom from './joinRoom'

class Home extends Component {

    render() {
        return (
            <main className='main'>
                <div className='card mt-4'>
                    <h1>Welcome to mafia game</h1>
                    <h3>Create a room</h3>
                    <StartRoom />
                    <h3>Join a room</h3>
                    <JoinRoom />
                </div>
            </main>
        )
    }
}

export default Home