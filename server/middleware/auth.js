const jwt = require('jsonwebtoken')

// authenticates token
module.exports = function(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({msg: "Token authorization failed"});
    }

    try {
        jwt.verify(token, process.env.JWT_KEY, (error, decoded) => {
            if (error) {
                return res.status(401).json({error:error, msg:"Token not valid"});
            } else {
                req.user = decoded;
                next();
            }

        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
};
