const express = require('express')

const MafiaCtrl = require('../controllers/mafia-controll')
const UserCtrl = require('../controllers/user-controll')
const PlayerCtrl = require('../controllers/player-controll')
const MessageCtrl = require('../controllers/message-controll')
const mafiaModel = require('../models/mafia-model')
const auth = require('../middleware/auth');

const router = express.Router()

router.post('/mafia/create', MafiaCtrl.createRoom)
router.post('/mafia/join', MafiaCtrl.joinRoom)
router.post('/mafia/startroom', UserCtrl.StartRoom)
router.get('/mafia/gamestate', MafiaCtrl.getRoom)

router.post('/mafia/owner', PlayerCtrl.owner)
router.post('/mafia/player', PlayerCtrl.player)
router.post('/mafia/message', MessageCtrl.message)


module.exports = router