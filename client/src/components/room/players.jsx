import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'
import {ReactComponent as IconBoot} from '../../style/icons/boot_kick.svg'
import {ReactComponent as IconVote} from '../../style/icons/vote_icon.svg'
import {ReactComponent as IconKnife} from '../../style/icons/knife_icon.svg'
import {ReactComponent as IconInvest} from '../../style/icons/investigate_icon.svg'

const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'

function Player(props) {
    // const [players, setplayers] = useState('');
    // const [game, setgame] = useState('');
    const [selected, setSelected] = useState('');
    const [lastState, setLastState] = useState('');

    useEffect(() => {
        // console.log(props.game)
        if (props.game.state != lastState) {
            setSelected('');
            setLastState(props.game.state);
        }
        
    }, [props.players, props.game, props.votes, props.player_status])

    function handleSubmit(chosen_player_id, action, url) {
        // console.log(chosen_player_id);

        const config = {
            headers: { 'Content-Type': 'application/json' },
        };
        const body = JSON.stringify(
            { 
                token : JSON.parse(localStorage['user'])['token'],
                action : action,
                chosen_player_id : chosen_player_id
            });

        try {
            axios.post(`${baseURL}/${url}`, body, config).then((result) => {
                // console.log(result);
                // console.log('kicked player' + chosen_player_id)
                setSelected(chosen_player_id)
            })
            
        } catch (err) {
            console.log(err);
        }
    }

    function Vote_count(vote_player_id) {
        if (props.game.state == "vote" && props.player_status.get(vote_player_id.vote_player_id)) {
            let votes = props.votes;
            if (votes != undefined) {
                let votes_string = JSON.stringify(votes)
                let votes_parsed = JSON.parse(votes_string)
                let vote_counts = new Map();
                for (const key in votes_parsed) {
                    let value = votes_parsed[key];
                    if (vote_counts.has(value)) {
                        vote_counts.set(value, (vote_counts.get(value) + 1));
                    } else {
                        vote_counts.set(value, 1);
                    }
                }
                if (vote_counts.has(vote_player_id.vote_player_id)) {
                    return <div>{vote_counts.get(vote_player_id.vote_player_id)}</div>
                } else {
                    return <div>0</div>
                }
                
            } else {
                return <div>0</div> 
            }
        }
    }

    function Player_buttons(button_player) {
        // console.log(button_player.player_button_id)
        if (props.owner === props.player_id && (props.game.state == "waiting" || props.game.state == "end")) {
            if (props.player_id != button_player.player_button_id ) {
                return (
                <div className='right-container'>
                    <button className='invisble-button' 
                            onClick={() => handleSubmit(button_player.player_button_id, "kick-player", "owner")}  
                            role="button" 
                            type="submit">
                        <IconBoot className='boot-icon'/>
                    </button>
                </div>)
            }
        }
        // console.log(button_player)
        // console.log(props.player_status.get(button_player.player_button_id))
        if (props.player_status.get(button_player.player_button_id) && props.player_status.get(props.player_id)) {
            if (props.game.state == "vote") {
                if (props.player_id != button_player.player_button_id ) {
                    return (
                    <div className='right-container'>
                        <button className={'invisble-button ' + (selected === button_player.player_button_id ? "player-button-active" : "") }
                                onClick={() => handleSubmit(button_player.player_button_id, "vote-player", "player")}  
                                role="button" 
                                type="submit">
                            <IconVote className='boot-icon'/>
                        </button>
                    </div>)
                }
            }
    
            if (props.game.state == "night") {
                let action_role = "";
                if (props.role == "ranger" || props.role == "littlefeetEVIL") {
                    action_role = "Investigate"

                    if (props.player_id != button_player.player_button_id ) {
                        return (
                        <div className='right-container'>
                            <button className={'invisble-button ' + (selected === button_player.player_button_id ? "player-button-active" : "") }
                                    onClick={() => handleSubmit(button_player.player_button_id, "role", "role")}  
                                    role="button" 
                                    type="submit">
                                <IconInvest className='boot-icon'/>
                            </button>
                        </div>)
                    }
                } else if (props.role == "hunter" || props.role == "sasquatchEVIL"){
                    action_role = "Kill"

                    if (props.player_id != button_player.player_button_id ) {
                        return (
                        <div className='right-container'>
                            <button className={'invisble-button ' + (selected === button_player.player_button_id ? "player-button-active" : "") }
                                    onClick={() => handleSubmit(button_player.player_button_id, "role", "role")}  
                                    role="button" 
                                    type="submit">
                                <IconKnife className='boot-icon'/>
                            </button>
                        </div>)
                    }
                }
            }
        }
    }

    if (props.players != undefined && props.dead_players != undefined) {
        return(
            <div className='grid-container'>
                <div className='grid-left-container'>
                    <div>Players</div>
                    <div className='players'>
                        <ol type="1">
                        {
                            props.players.map((m, i) => {
                                return (
                                    <div key={i} className={`${m.player_id}-id`}>
                                        <li>
                                        <div className='beside-container'> 
                                            <div className={`living-${props.player_status.get(m.player_id)} player-nickname left-container`}>{m.nickname}</div>
                                            <Player_buttons player_button_id={m.player_id}/>
                                            <Vote_count vote_player_id={m.player_id}/>
                                        </div>
                                        </li>
                                    </div>)
                            })
                        }
                        </ol>
                    </div>
                </div>
                <div className='grid-right-container'>
                    <div className='graveyard'>
                        <div>Graveyard</div>
                        <ul>
                        {
                            props.dead_players.map((m, i) => {
                                return (
                                    <div key={i} className={`${m.dead_player_id}-id`}>
                                        <li>                                        
                                        <div className='beside-container'> 
                                            <div>{m.dead_player_nickname} ({m.dead_player_role})</div>
                                        </div>
                                        </li>
                                    </div>)
                            })
                        }
                        </ul>
                    </div>
                </div>
            </div>
        );
    } else {
        return(
            <div>
                <div>Player</div>
                <div>Graveyard</div>
            </div>
        );
    }

}

export default Player;
