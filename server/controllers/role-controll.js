const Mafia = require('../models/mafia-model')
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

    Mafia.findOne({roomid:user.room}).lean().then((data) => {

        //todo
        // if check for correct state, both player are alive
        // throw new Error("something");
        const against_player_info = data.players.find(element => element.player_id == against_player_id);
        console.log(against_player_info)

        const player_role = data.game.roles[user.player_id];
        console.log(player_role)
        console.log(data.role_counter)
        console.log(data.role_counter[player_role])
        const player_role_counter = data.role_counter[player_role];

        if (player_role_counter === undefined || player_role_counter > 0) {
            Mafia.updateOne({roomid:user.room}, {
                $set: {
                    ["night." + player_role] : {
                        player_id: user.player_id,
                        against_id: against_player_info.player_id
                    }
                }
                
            }).catch(error => {
                console.log(error);
            });
        } else {
            console.log("do nothing no more roles left")
        }

        console.log("Night")

        return res.status(201).json(
            {success: true,
            message: 'Player night action: ' + user.player_id,
            role: player_role,
            data: [data]})

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