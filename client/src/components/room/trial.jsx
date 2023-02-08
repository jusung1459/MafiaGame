import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Trial(props) {
    const [players, setplayers] = useState('');
    const [game, setgame] = useState('');
    const [trial_player, settrial_player] = useState('');

    useEffect(() => {
        console.log(props)
        
    }, [props.game])

    function handleStartSubmit(vote_type) {

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const body = JSON.stringify(
            { 
                token : JSON.parse(localStorage['user'])['token'],
                action : 'trial-vote-player',
                vote : vote_type 
            });

        try {
            axios.post(`${baseURL}/player`, body, config).then((result) => {
                // console.log('start room')
            })
            
        } catch (err) {
            console.log(err);
        }
    }

    if (props.game.state == 'trial' && (props.player_id != props.trial_player.trial_player)) {
        return(
            <div className='owner-container'>
                <button onClick={() => handleStartSubmit("guilty")} role="button" type="submit">
                    <section className="flex items-center">Guilty</section>
                </button>
                <button onClick={() => handleStartSubmit("inno")} role="button" type="submit">
                    <section className="flex items-center">Innocent</section>
                </button>
            </div>
        );
    } else {
        return <div></div>
    }

}

export default Trial;
