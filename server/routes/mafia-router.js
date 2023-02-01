const express = require('express')

const MafiaCtrl = require('../controllers/mafia-controll')
const UserCtrl = require('../controllers/user-controll')
const playerCtrl = require('../controllers/player-controll')
const mafiaModel = require('../models/mafia-model')
const auth = require('../middleware/auth');

const router = express.Router()

router.post('/mafia/create', MafiaCtrl.createRoom)
router.post('/mafia/join', MafiaCtrl.joinRoom)
router.post('/mafia/startroom', UserCtrl.StartRoom)
router.get('/mafia/gamestate', MafiaCtrl.getRoom)

router.post('/mafia/owner', playerCtrl.owner)

module.exports = router