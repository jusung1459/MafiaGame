const express = require('express')

const MafiaCtrl = require('../controllers/mafia-controll')
const UserCtrl = require('../controllers/user-controll')
const PlayerCtrl = require('../controllers/player-controll')
const MessageCtrl = require('../controllers/message-controll')
const RoleCtrl = require('../controllers/role-controll')
const mafiaModel = require('../models/mafia-model')

const MafiaCtrl_redis = require('../controllers-redis/mafia-controll')
const UserCtrl_redis = require('../controllers-redis/user-controll')
const PlayerCtrl_redis = require('../controllers-redis/player-controll')
const MessageCtrl_redis = require('../controllers-redis/message-controll')
const RoleCtrl_redis = require('../controllers-redis/role-controll')

const auth = require('../middleware/auth');

const router = express.Router()

router.post('/mafia/create', MafiaCtrl.createRoom)
router.post('/mafia/join', MafiaCtrl.joinRoom)
router.post('/mafia/startroom', UserCtrl.StartRoom)
router.get('/mafia/gamestate', MafiaCtrl.getRoom)

router.post('/mafiaredis/create', MafiaCtrl_redis.createRoom)
router.post('/mafiaredis/join', MafiaCtrl_redis.joinRoom)

router.post('/mafia/owner', PlayerCtrl.owner)
router.post('/mafia/player', PlayerCtrl.player)
router.post('/mafia/message', MessageCtrl.message)
router.post('/mafia/role', RoleCtrl.role)


module.exports = router