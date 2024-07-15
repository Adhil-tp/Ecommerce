const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    code: { required: true, type: String },
    description: { required: true, type: String },
    discount: { type: Number, required: true },
    usableFor: { type: mongoose.Schema.Types.Mixed  , required : true}
},{timestamps : true})

module.exports = mongoose.model('coupons', couponSchema)