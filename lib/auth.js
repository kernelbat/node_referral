var jwt = require('jsonwebtoken');
let user = require('../models/user');
const helper = require('../lib/helper');


const authenticateUser = async (req, res, next) => {
    const token = req.headers.token ? req.headers.token : req.query.token;
    const decoded = jwt.decode(token, "testapi#####");
    console.log("decoded authenticateUser", decoded, token)
    try {
        const userData = await user.findOne({ _id: decoded.user_id }).select('-password').exec();

        console.log("decoded userData", userData)
        if (!userData || userData == undefined) {
            return res.status(200).json({
                title: 'user not found',
                error: true,
            });
        }
        req.user = userData;
        return next(null, userData);
    }
    catch (error) {
        return res.status(200).json({
            title: 'Authorization required.',
            error: true,
        });
    }
}

module.exports = {
    authenticateUser
}