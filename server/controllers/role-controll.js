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

        console.log("Night")

        const night = data.night;
        const night_roles = new Map(Object.entries(data.night));
        const roles = new Map(Object.entries(data.game.roles));

        night_roles.forEach((value, role) => {
            switch (role) {
                case 'ranger':
                    // get against_id players role
                    // send message through secret channel
                    const against_role = roles.get(value.against_id);
                    console.log(against_role);
                    let message = { "nickname" : "Game",
                                    "player_id" : "0"};
                    message["message"] = value.against_id + " abstained";
                    let messages = [];
                    messages.push(message);
                    Mafia.updateOne({roomid:user.room}, {
                        $push: {
                            ["secret." + user.player_id] : {
                                messages : { $each : messages }
                            }
                        }
                    }).then((data) => console.log(data)
                    ).catch(error => {
                        console.log(error);
                    });
                    break;
                case 'littlefeetEVIL':
                    break;
                case 'hunter':
                    break;
                case 'sasquatchEVIL':
                    break;
                default:
                    break;
            }
        });

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