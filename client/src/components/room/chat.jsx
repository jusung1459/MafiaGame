import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Chat(props) {
    const [message, setMessage] = useState('');
    const messageEl = useRef(null);

    useEffect(() => {
        // to make scroll stuck to bottom on new message
        // console.log('from child' + props.messages)
        if (messageEl) {
          messageEl.current.addEventListener('DOMNodeInserted', event => {
            const { currentTarget: target } = event;
            target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
          });
        }
    }, [props.messages]);

    function handleMsgSubmit() {

        if (message != '') {
            console.log(message);

            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            const body = JSON.stringify(
                { 
                    message:message,
                    token : JSON.parse(localStorage['user'])['token']
                });
    
            try {
                axios.post(`${baseURL}/message`, body, config).then((result) => {
                    console.log('sent message')
                })
                
            } catch (err) {
                console.log(err);
            }
        }

        setMessage('');
    }
    

    if (props.messages != undefined) {
        return(
            <div className="chat-room" target="_blank">
                <h1>chat</h1>
                <div className='messages' ref={messageEl}>
                    {
                    props.messages.map((m, i) => {
                        return <div key={i} className={`{m.player_id} beside-container`}>
                            <div className='left-container'>{m.nickname}:</div>
                            <div className='right-container'>{m.message}</div>
                        </div>
                    })
                    }
                </div>
                <div className='beside-container'>
                    <div className='left-container'>
                        <input id="nickname-input"
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                            placeholder="Type message here" 
                            maxLength="100"/>
                    </div>
                    <div className='right-container'>
                        <button onClick={handleMsgSubmit} role="button" type="submit">
                            <section className="flex items-center"> Send Message</section>
                        </button>
                    </div>
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
