import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Owner(props) {
    const [players, setplayers] = useState('');
    const [game, setgame] = useState('');

    useEffect(() => {
        console.log(props)
        
    }, [props.game])

    function handleStartSubmit() {

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const body = JSON.stringify(
            { 
                token : JSON.parse(localStorage['user'])['token']
            });

        try {
            axios.post(`${baseURL}/startroom`, body, config).then((result) => {
                console.log('start room')
            })
            
        } catch (err) {
            console.log(err);
        }
    }

    if (props.game.state == 'waiting' && props.owner === props.player_id) {
        return(
            <div className='owner-container'>
                <button onClick={() => handleStartSubmit()} role="button" type="submit">
                    <section className="flex items-center">Start Game</section>
                </button>
            </div>
        );
    }
    if (props.game.state == 'end' && props.owner === props.player_id) {
        return(
            <div className='owner-container'>
                <button onClick={() => handleStartSubmit()} role="button" type="submit">
                    <section className="flex items-center">Play Again</section>
                </button>
            </div>
        );
    }

}

export default Owner;
