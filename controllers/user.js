/* NODE-MODULES */
const async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcryptjs');
const helper = require('../lib/helper');
const { check, validationResult, body } = require('express-validator');
const randomstring = require("randomstring");
var jwt = require('jsonwebtoken');
const referralModel = require('../models/referral');

/* Model */
const userModel = require('../models/user');

/* CONTROLLER MODULES */

/*
# parameters: token,
# purpose: login for users
*/
const signin = async (req, res) => {
    console.log('signin req.body ', req.body);

    const result = validationResult(req);

    console.log('signin errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    let userData = await userModel.getUser({ email: req.body.email });
    if (userData.password && req.body.password && bcrypt.compareSync(req.body.password, userData.password)) {
        helper.generateToken(userData, (token) => {

            return res.status(200).json({
                title: "Logged in successfully",
                error: false,
                token: token
            });
        })
    } else {
        return res.status(200).json({
            title: 'You have entered an invalid username or password',
            error: true
        });
    }


}
/*
# parameters: userToken
# Variables used : token
# purpose: remote validation of email
*/
const validateEmail = async (req, res) => {
    console.log("validateEmail req.body", req.body);

    const result = validationResult(req);
    console.log('validateEmail errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }
    let query = req.body.email ? { email: req.body.email.trim().toLowerCase() } : { mobile: req.body.mobile }

    let userData = await userModel.getUser(query);

    console.log("validateEmail userData", userData);

    if (userData && req.body.user_id) {
        if (userData && (ObjectId(userData._id).equals(ObjectId(req.body.user_id)))) {
            return res.status(200).json({
                error: false,
                isExist: false
            })
        }
        return res.status(200).json({
            error: false,
            isExist: true
        })
    } else if (userData && !req.body.user_id) {
        return res.status(200).json({
            error: false,
            isExist: true
        })
    }
    else {
        return res.status(200).json({
            error: false,
            isExist: false
        })
    }
}


/*
# parameters: userToken
# purpose: user signup
*/
const signup = async (req, res) => {
    console.log('signup req.body ', req.body);
    const result = validationResult(req);

    console.log('signup errors ', result);
    if (result.errors.length > 0) {
        return res.status(200).json({
            error: true,
            title: result.errors[0].msg,
            errors: result
        });
    }

    let userData = await userModel.getUser({ email: req.body.email });

    if (userData) {
        return res.status(200).json({
            title: 'User email ID already exists.',
            error: true
        })
    }
    let data = await userModel.getUser({ referral_code: req.body.referral_code, referral_code_expired: { $gte: new Date } });
    if (req.body.referral_code && !data) {
        return res.status(200).json({
            error: true,
            title: 'Referal code/link has been expired'
        })
    }
    //user model
    var newUser = new userModel({
        name: req.body.name,
        email: req.body.email.trim().toLowerCase(),
        unique_name: randomstring.generate(7),
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    })

    if (data) {
        newUser.referred_by = data._id
    }
    newUser.save(async (err, savedUser) => {
        console.log('signup userData save err ', err);
        helper.generateToken(savedUser, async (token) => {
            if (req.body.referral_code && req.body.referral_code != "") {

                if (data) {
                    referralModel.addReferrals(data, savedUser)
                }
            }
            return res.status(200).json({
                title: "User saved successfully",
                error: false,
                token: token,
                data: savedUser
            });
        })
    })

}
const getUser = async (req, res) => {
    res.status(200).json({
        error: false,
        data: req.user
    })
}
// link token can be appended to frontend side weburl specially for reactjs components
const getInvitationLink = async (req, res) => {
    try {

        //referral code 
        let user = await userModel.getUser({ _id: req.user._id }).then(result => result)
        user.referral_code = randomstring.generate(5);
        let refUser = await userModel.getUser({ referral_code: user.referral_code }).then(result => result);

        if (refUser) {
            user.referral_code = randomstring.generate(5);
        }

        helper.generateLinkToken(user, (linkToken) => {

            user.referral_code_expired = new Date(new Date().getTime() + 60 * 60 * 24 * 1000);
            user.save().then(result => result)
            res.status(200).json({
                error: false,
                linkToken,
                code: user.referral_code
            })
        })
    } catch (error) {
        console.log('error', error)
        res.status(200).json({
            error: true,
            title: error
        })
    }

}
/*This api will be used for verifying referral code or token from invite link
referral code can be used for remote validation while entering in textbox
referral token can be used when user is using link*/
const verifyLink = async (req, res) => {
    try {
        let data = req.body.referral_token ? helper.decodeToken(req.body.referral_token) : req.body.referral_code
        if (data) {
            let user = await userModel.getUser({ _id: req.user._id, referral_code: data.referral_code ? data.referral_code : req.body.referral_code, referral_code_expired: { $gte: new Date() } }).then(result => result);
            console.log('user', user)
            if (user) {
                res.status(200).json({
                    error: false,
                    data
                })
            } else {
                res.status(200).json({
                    error: true,
                    title: 'Invalid link'
                })
            }
        } else {
            res.status(200).json({
                error: true,
                title: 'Invalid link'
            })
        }
    } catch (error) {
        console.log('errr', error)
        res.status(200).json({
            error: true,
            title: error.message ? 'Link expired' : 'Something went wrong'
        })
    }

}

// Api to get user counts registered with referral
const getReferrals = async (req, res) => {
    try {
        let query = req.query.code ? { referral_code: req.query.code } : {}//accept in query ?code='somecode'
        let data = await referralModel.getReferrals(query).then(result => result)
        res.status(200).json({
            error: false,
            data
        })

    } catch (error) {
        res.status(200).json({
            error: true,
            title: error
        })
    }


}
const getFriendHirarchy = async (req, res) => {
    try {
        let query = [{
            $match: {
                _id: ObjectId(req.user._id)
            },
        },
        {
            $graphLookup: {
                from: "users",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "referred_by",
                as: "friends",

            }
        }
        ];
        let data = await userModel.getByAggregate(query)
        res.status(200).json({
            error: false,
            data
        })
    } catch (error) {
        res.status(200).json({
            error: true,
            title: error
        })
    }


}

module.exports = {
    signin,
    signup,
    getUser,
    validateEmail,
    getInvitationLink,
    verifyLink,
    getReferrals,
    getFriendHirarchy

}