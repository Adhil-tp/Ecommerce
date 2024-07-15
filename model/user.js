const mongoose = require('mongoose')
const { defaultMaxListeners } = require('nodemailer/lib/xoauth2')
const validator = require('validator')
const { default: isEmail } = require('validator/lib/isEmail')

const userSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        // required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (email) {
                return validator.isEmail(email)
            },
            message: props => `${props.value} is not valid email`
        }
    },
    isAdmin : {type : Boolean , default : false},
    password: { type: String, required: true },
    lastPurchaseDat: { type: Date, default: null },
    purchasedProducts: [{
        productId: { type: mongoose.Types.ObjectId },
        quantity: { type: Number, default: 0 }
    }]
}, {timestamps : true})

module.exports = mongoose.model('users', userSchema)
