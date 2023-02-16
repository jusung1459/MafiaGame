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

        // const night_roles = new Map(Object.entries(data.night));
        // const roles = new Map(Object.entries(data.game.roles));

        // const role_investigation = {
        //     "ranger" : " upkeeps the park",
        //     "sasquatchEVIL" : " is very hairy",
        //     "camper" : " sing songs and roast marshmellows",
        //     "hunter" : " has a gun!", 
        //     "littlefeetEVIL": " is hairy with small feet", 
        //     "lumberjack" : " chop chop chops", 
        //     "bigfeetEVIL" : " has massive feet!"
        // };

        // night_roles.forEach((value, role) => {
        //     console.log(role);
        //     console.log(value);
        //     against_role = roles.get(value.against_id);
        //     const against_player_info = data.players.find(element => element.player_id == value.against_id);
        //     if (role === 'ranger' || role === 'littlefeetEVIL') {
        //         // get against_id players role
        //         // send message through secret channel
        //         const against_role = roles.get(value.against_id);
        //         let message = { "nickname" : "Game",
        //                         "player_id" : "0"};
                
        //         message["message"] = against_player_info.nickname + role_investigation[against_role];
        //         let messages = [];
        //         messages.push(message);
        //         Mafia.updateOne({roomid:user.room}, {
        //             $push: {
        //                 ["secret." + value.player_id] : message
        //             }
        //         }).catch(error => {
        //             console.log(error);
        //         });
        //     } else if (role === 'hunter' || role === 'sasquatchEVIL') {

        //     }
        // });

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