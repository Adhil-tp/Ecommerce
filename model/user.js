const mongoose = require('mongoose')
const validator = require('validator')
const { default: isEmail } = require('validator/lib/isEmail')

const userSchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (email) {
                return validator.isEmail(email)
            },
            message: props => `${props.value} is not valid email`
        }
    }
})