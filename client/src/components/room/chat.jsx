import React, { useRef, useEffect } from 'react'
import axios from 'axios'
import '../../style/room.css'

import {ReactComponent as IconSend} from '../../style/icons/send_button.svg'

const baseURL = 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api/mafia'

function Chat(props) {
    // const [message, setMessage] = useState('');
    const messageRef = useRef('');
    const messageEl = useRef(null);

    useEffect(() => {
        // to make scroll stuck to bottom on new message
        // console.log('from child' + props.messages)
        if (messageEl) {
            new MutationObserver((mut) => {
                const target = mut[0].target
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
            }).observe(messageEl.current, {childList : true})
            
        }
    }, [props.messages]);

    function handleMsgSubmit() {

        if (messageRef.current.value !== '') {
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

    function handleMsgEnterSubmit(event) {
        var code = event.keyCode || event.which;
        if(code === 13) { //13 is the enter keycode
            handleMsgSubmit();
        } 
    }

    function RenderMessage(msg) {
        // console.log(msg.index, msg.msg)
        return (<div className={`${msg.msg.player_id}-msg beside-container`}>
                    <div className={`msg-${msg.msg.player_id} left-container`}>{msg.msg.nickname}:</div>
                    <div className='right-container msg-text'>{msg.msg.message}</div>
                </div>)
        
    }
    

    if (props.messages !== undefined) {
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
                        <input id="nickname-input"
                            // onChange={(e) => setMessage(e.target.value)}
                            ref={messageRef}
                            placeholder="Type message here" 
                            maxLength="100"
                            type="text"
                            onKeyUp={handleMsgEnterSubmit}/>
                        <button className='msg-button' onClick={handleMsgSubmit} role="button" type="submit">
                            <IconSend className='send-icon boot-icon'/>
                        </button>
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
