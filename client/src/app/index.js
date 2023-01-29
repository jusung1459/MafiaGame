import React from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route
  } from "react-router-dom";

import { Home, Room } from '../components'

import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/room/:roomid" element={<Room/>} />
            </Routes>
        </div>  
    )
}

export default App