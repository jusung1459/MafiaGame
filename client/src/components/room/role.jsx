import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Role(props) {

    function renderRoleCount() {
        if (props.role_counter >= 0) {
            return <div>{props.role_counter} role action left</div>
        }
    }

    if (props.player_status.get(props.player_id)) {
        console.log(props.player_status)
        return (
            <div>
                <h4>Role : {props.role}</h4>
                <div>You are Alive</div>
                <div>{renderRoleCount()}</div>
            </div>)
    } else {
        return (
            <div>
                <h4>Role : {props.role}</h4>
                <div>You are Dead</div>
            </div>)
    }

}

export default Role;
