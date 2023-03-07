// import React, { useRef, useEffect, useState } from 'react'
import React from 'react'
import '../../style/room.css'

// const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'

function Role(props) {

    const information_roles = {
        "ranger" : "Investigate each night",
        "hunter" : "Choose to take justice into your own hands and shoot someone",
        "lumberjack" : "Protect one person from death each night",
        "camper" : "Sing songs and burn marshmellows",
        "sasquatchEVIL" : "Kill a camper each night",
        "littlefeetEVIL" : "Investigate each night",
        "bigfeetEVIL" : "You carry out the Sasqutch's order"
    };

    const faction_role = {
        "camp" : "Your goal is to find all the  hairy monsters from your camp",
        "evil" : "Your goal is to eliminate the camp"
    };

    function renderGoal() {
        if (props.role !== undefined) {
            if (props.role.includes("EVIL")) {
                return <div>{faction_role["evil"]}</div>
            } else {
                return <div>{faction_role["camp"]}</div>
            }
        }
    }

    function renderRoleCount() {
        if (props.role_counter >= 0) {
            return <div>{props.role_counter} role action left</div>
        }
    }
    if (props.game.state !== 'waiting') {
        if (props.player_status.get(props.player_id)) {
            // console.log(props.player_status)
            return (
                <div>
                    <h4>Role : {props.role}</h4>
                    <div>{information_roles[props.role]}</div>
                    <div>{renderGoal()}</div>
                    <div className='role-style'>You are Alive</div>
                    <div className='role-style'>{renderRoleCount()}</div>
                </div>)
        } else {
            return (
                <div>
                    <h4>Role : {props.role}</h4>
                    <div>{information_roles[props.role]}</div>
                    <div>{renderGoal()}</div>
                    <div className='role-style'>You are Dead</div>
                </div>)
        }
    }

}

export default Role;
