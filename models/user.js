const { query } = require('express-validator');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
    name: String,
    unique_name: {      //random string for voice call
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false
    },

    password: {
        type: String,
        required: false
    },
    referral_code: String,
    token: Number,
    referral_code_expired: Date,
    referred_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    }

},
    {
        timestamps: true
    });

const user = module.exports = mongoose.model('user', schema);

module.exports.getUser = async (query) => {
    let data = await user.findOne(query).then(result => result)
    return data
}
module.exports.getByAggregate = async (query) => {
    let data = await user.aggregate(query).then(result => result);
    return data
}