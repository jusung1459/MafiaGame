import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'
import {ReactComponent as IconSave} from '../../style/icons/save_icon.svg'
import {ReactComponent as IconLynch} from '../../style/icons/lynch_icon.svg'

const baseURL = 'http://localhost:3000/api/mafia'

function Trial(props) {
    const [players, setplayers] = useState('');
    const [game, setgame] = useState('');
    const [trial_player, settrial_player] = useState('');

    useEffect(() => {
        // console.log(props)
        
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

    if (props.game.state == 'trial') {
        if (props.player_id != props.trial_player.trial_player) {
            const against_player = props.players.find((player) => {
                
                return player.player_id == props.trial_player.trial_player;
            });
            if (against_player != undefined) {
                return(
                    <div>
                        <div className='owner-container'>
                            <button className='invisble-button trial-button' id="lynch-button" onClick={() => handleStartSubmit("guilty")} role="button" type="submit">
                                <IconLynch className='boot-icon' width="3em" height="3rem"/>
                            </button>
                            <button className='invisble-button trial-button' id="save-button" onClick={() => handleStartSubmit("inno")} role="button" type="submit">
                                <IconSave className='boot-icon' width="3em" height="3rem"/>
                            </button>
                        </div>
                        <div className='vote-for'>voting {against_player.nickname}</div>
                    </div>
                );
            }
        } else {
            return(
            <div>
                <div>You are on trial. State your case!</div>
            </div>)
        }
        
    } else {
        return <div></div>
    }

}

export default Trial;
