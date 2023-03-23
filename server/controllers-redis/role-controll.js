const { redisClient } = require('../db/index')
const helper = require('../helpers/helper')
const jwt = require('jsonwebtoken');

// ranger - can investigate
// camper - can do nothing
// hunter - can kill a person once
// lumberjack - can protect
// sasquatchEVIL - can kill
// littlefeetEVIL - can do nothing
// bigfeetEVIL - can 

role = (req, res) => {
    const token = req.body.token;
    const against_player_id = req.body.chosen_player_id;


    const user = jwt.verify(token, process.env.JWT_KEY);

    if (user == null) {
        return res.status(400).json({
            message: 'Invalid Token',
        })
    };

    redisClient.json.get(`mafia:${user.room}`).then((data) => {
        const against_player_info = data.players.find(element => element.player_id == against_player_id);
        const player_info = data.players.find(element => element.player_id == user.player_id);

        if (player_info.living && against_player_info.living) {
            const player_role = data.game.roles[user.player_id];
            const player_role_counter = data.role_counter[player_role];
    
            if (player_role_counter === undefined || player_role_counter > 0) {
                redisClient.json.set(`mafia:${user.room}`, "$.night." + player_role, {
                    player_id: user.player_id,
                    against_id: against_player_info.player_id
                }).catch(error => {
                    console.log(error);
                });
            } else {
                console.log("do nothing no more roles left")
            }
    
            return res.status(201).json(
                {success: true,
                message: 'Player night action: ' + user.player_id})
        } else {
            return res.status(201).json(
                {success: false,
                message: 'player is dead'})
        }


    }).catch(error => {
        console.log(error);
        return res.status(400).json({
            error,
            message: 'Cant user role',
        })
    });

}

module.exports = {
    role,
}