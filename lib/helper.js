/* NODE-MODULES */
const jwt = require('jsonwebtoken');

const generateToken = (userData, cb) => {
    console.log('userData', userData)
    var token = jwt.sign({
        email: userData.userData ? userData.userData.email : userData.email,
        user_id: userData.userData ? userData.userData._id : userData._id,
        user_type: userData.userData ? userData.userData.user_type : userData.user_type,
        isMobile: userData.isMobile ? userData.isMobile : false,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 1000),

    }, "testapi#####");
    cb(token)
}

const decodeToken = (token) => {
    var decoded = jwt.verify(token, "testapi#####");
    console.log('decoded', decoded)
    return decoded;
}
const generateLinkToken = (user, cb) => {
    var token = jwt.sign({
        _id: user._id,
        referral_code: user.referral_code,

    }, "testapi#####", { expiresIn: '24h' });
    cb(token)
}



module.exports = {
    generateToken,
    decodeToken,
    generateLinkToken
}