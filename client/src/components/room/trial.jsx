import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'
import {ReactComponent as IconSave} from '../../style/icons/save_icon.svg'
import {ReactComponent as IconLynch} from '../../style/icons/lynch_icon.svg'

const baseURL = 'http://localhost:3000/api/mafia'

function Trial(props) {
    // const [players, setplayers] = useState('');
    // const [game, setgame] = useState('');
    // const [trial_player, settrial_player] = useState('');

    const [active_lynch, setActive_lynch] = useState(false);
    const [active_save, setActive_save] = useState(false);

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
                // to toggle active button pressed
                if (vote_type == "guilty") {
                    setActive_lynch(true);
                    setActive_save(false);
                } else {
                    setActive_lynch(false);
                    setActive_save(true);
                }
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
                            <button className={'invisble-button trial-button ' + (active_lynch && 'trial-active')} id="lynch-button" onClick={() => handleStartSubmit("guilty")} role="button" type="submit">
                                <IconLynch className='boot-icon' width="3em" height="3rem"/>
                            </button>
                            <button className={'invisble-button trial-button ' + (active_save && 'trial-active')} id="save-button" onClick={() => handleStartSubmit("inno")} role="button" type="submit">
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
