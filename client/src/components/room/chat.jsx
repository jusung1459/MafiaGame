import React, { useRef, useEffect, useState } from 'react'
import socketIO from 'socket.io-client';
import axios from 'axios'
import '../../style/room.css'

const baseURL = 'http://localhost:3000/api/mafia'

function Chat(props) {
    // const [message, setMessage] = useState('');
    const messageRef = useRef('');
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

        if (messageRef.current.value != '') {
            console.log(messageRef.current.value);

            const config = {
                headers: { 'Content-Type': 'application/json' },
            };
            const body = JSON.stringify(
                { 
                    message:messageRef.current.value,
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

        messageRef.current.value = '';
    }

    function RenderMessage(msg) {
        // console.log(msg.index, msg.msg)
        return (<div className={`${msg.msg.player_id}-msg beside-container`}>
                    <div className={`msg-${msg.msg.player_id} left-container`}>{msg.msg.nickname}:</div>
                    <div className='right-container msg-text'>{msg.msg.message}</div>
                </div>)
        
    }
    

    if (props.messages != undefined) {
        return(
            <div className="chat-room">
                <div className='messages' ref={messageEl}>
                    {
                    props.messages.map((m, i) => {
                        return <div key={i}><RenderMessage msg={m} index={i}/> </div>
                    })
                    }
                </div>
                <div className='input-container'>
                    <div className='left-input msg-input'>
                        <input id="nickname-input"
                            // onChange={(e) => setMessage(e.target.value)}
                            ref={messageRef}
                            placeholder="Type message here" 
                            maxLength="100"/>
                    </div>
                    <div className='right-input msg-input'>
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
