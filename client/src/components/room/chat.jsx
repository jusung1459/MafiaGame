import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Chat(props) {

    const messageEl = useRef(null);

    useEffect(() => {
        // to make scroll stuck to bottom on new message
        if (messageEl) {
          messageEl.current.addEventListener('DOMNodeInserted', event => {
            const { currentTarget: target } = event;
            target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
          });
        }
    }, [])
    

    if (props.messages != undefined) {
        return(
            <div className="chat-room" target="_blank">
                <h1>chat</h1>
                <div className='messages' ref={messageEl}>
                {
                props.messages.map((m, i) => {
                    console.log(m.message);
                    return <div key={i} className={`{m.player_id}`}>
                        <div>{m.nickname}</div>
                        <div>{m.message}</div>
                    </div>
                })
                }
                </div>
            </div>
            
        );
    } else {
        return(
            <div>chat</div>
            
        );
    }

}

export default Chat;
