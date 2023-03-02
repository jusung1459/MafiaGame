
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://' + process.env.REACT_APP_URL_ADDRESS + ':3000/api',
})