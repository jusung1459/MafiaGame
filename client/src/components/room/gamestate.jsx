import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'

function Gamestate(props) {
    const [game, setgame] = useState('');

    useEffect(() => {
        // console.log(props)
        
    }, [props.game])

    return(
        <div className='Gamestate-container'>
            <div>{props.game.state} : {props.time}</div>
        </div>
    );
    

}

export default Gamestate;
