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
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/room" element={<Room/>} />
        </Routes>
    )
}

export default App