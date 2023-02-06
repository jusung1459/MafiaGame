import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Player(props) {
    const [players, setplayers] = useState('');
    const [game, setgame] = useState('');

    useEffect(() => {
        // to make scroll stuck to bottom on new message
        console.log('from child' + props.players)
        console.log(props)
        
    }, [props.players, props.game])

    function handleKickSubmit(kick_player_id) {
        console.log(kick_player_id);

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const body = JSON.stringify(
            { 
                token : JSON.parse(localStorage['user'])['token'],
                action : "kick-player",
                kick_player_id : kick_player_id
            });

        try {
            axios.post(`${baseURL}/owner`, body, config).then((result) => {
                console.log('kicked player' + kick_player_id)
            })
            
        } catch (err) {
            console.log(err);
        }
    }

    function Player_buttons(button_player) {
        console.log(button_player.player_button_id)
        if (props.owner === props.player_id && props.game.state == "waiting") {
            if (props.player_id != button_player.player_button_id ) {
                return (
                <div className='right-container'>
                    <button onClick={() => handleKickSubmit(button_player.player_button_id)}  role="button" type="submit">
                        <section className="flex items-center"> Kick player</section>
                    </button>
                </div>)
            }
        }
        if (props.game.state == "vote") {
            if (props.player_id != button_player.player_button_id ) {
                return (
                <div className='right-container'>
                    <button onClick={() => handleKickSubmit(button_player.player_button_id)}  role="button" type="submit">
                        <section className="flex items-center"> Vote player</section>
                    </button>
                </div>)
            }
        }
    }

    if (props.players != undefined) {
        return(
            <div className='players-container'>
                <div className='players'>
                    <ol type="1">
                    {
                        props.players.map((m, i) => {
                            return (
                                <div key={i} className={`${m.player_id}-id`}>
                                    <li>
                                    <div className='beside-container'> 
                                        <div className='player-nickname left-container'>{m.nickname}</div>
                                        <Player_buttons player_button_id={m.player_id}/>
                                    </div>
                                    </li>
                                </div>)
                        })
                    }
                    </ol>
                </div>
            </div>
        );
    } else {
        return(
            <div>Player</div>
            
        );
    }

}

export default Player;
