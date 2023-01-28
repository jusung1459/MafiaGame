const express = require('express')

const MafiaCtrl = require('../controllers/mafia-controll')
const mafiaModel = require('../models/mafia-model')
const auth = require('../middleware/auth');


const router = express.Router()

router.post('/mafia', MafiaCtrl.createRoom)
router.get('/mafia', MafiaCtrl.getRoom)

module.exports = router