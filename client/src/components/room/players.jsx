import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Player(props) {
    const [players, setplayers] = useState('');

    useEffect(() => {
        // to make scroll stuck to bottom on new message
        console.log('from child' + props.players)
        
    }, [props.players])
    

    if (props.players != undefined) {
        return(
            <div className='players-container'>
                <div className='players'>
                    <ol type="1">
                    {
                        props.players.map((m, i) => {
                            return (
                                <div key={i} className={`{m.player_id}`}>
                                    <li>
                                    <div className='player-nickname'>{m.nickname}</div>
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
