var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
    referror_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    used_by_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    referral_code: String
}, {
    timestamps: true
});

const referral = module.exports = mongoose.model('referral', schema);
module.exports.addReferrals = async (referror, used_by) => {
    let refer = new referral({
        referror_id: referror._id,
        used_by_id: used_by._id,
        referral_code: referror.referral_code
    })

    refer.save((error, data) => {
        console.log('getReferrals error --- ', error, data);

        if (error) {

        }
    })
}
module.exports.getReferrals = async (query) => {
    let data = await referral.find(query).then(result => result);
    return data
}