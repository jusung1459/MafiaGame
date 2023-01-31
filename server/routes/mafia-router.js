const express = require('express')

const MafiaCtrl = require('../controllers/mafia-controll')
const UserCtrl = require('../controllers/user-controll')
const mafiaModel = require('../models/mafia-model')
const auth = require('../middleware/auth');

const router = express.Router()

router.post('/mafia/create', MafiaCtrl.createRoom)
router.post('/mafia/join', MafiaCtrl.joinRoom)
router.post('/mafia/startroom', UserCtrl.StartRoom)
router.get('/mafia/gamestate', MafiaCtrl.getRoom)

module.exports = router