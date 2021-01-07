/* NODE-MODULES */
const express = require('express');
const router = express.Router();
var auth = require("../lib/auth");
const { check, validationResult, body } = require('express-validator');

/* CONTROLLER MODULES */
const userController = require('../controllers/user');

router.post('/signin', (req, res, next) => {
    userController.signin(req, res);
});
router.post('/signup', [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Email is required').notEmpty(),
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').notEmpty(),
], (req, res, next) => {
    userController.signup(req, res);
});

router.post('/getUser', [auth.authenticateUser], (req, res) => {
    userController.getUser(req, res)
})
router.get('/getInvitationLink', [auth.authenticateUser], (req, res) => {
    userController.getInvitationLink(req, res)
})
router.post('/verifyLink', [auth.authenticateUser], (req, res) => {
    userController.verifyLink(req, res)
})
router.get('/get-users-code', (req, res) => {
    userController.getReferrals(req, res)
})
router.get('/get-users-with-friends', [auth.authenticateUser], (req, res) => {
    userController.getFriendHirarchy(req, res)
})

module.exports = router;