import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Role(props) {

    if (props.player_status.get(props.player_id)) {
        return (
            <div>
                <h1>Role : {props.role}</h1>
                <div>You are Alive</div>
            </div>)
    } else {
        return (
            <div>
                <h1>Role : {props.role}</h1>
                <div>You are Dead</div>
            </div>)
    }

}

export default Role;
