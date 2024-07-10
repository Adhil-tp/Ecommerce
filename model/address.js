const mongoose = require('mongoose')
const validator = require('validator')

const addressSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId , required : true},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    pin: { type: Number, required: true },
    postOffice: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    houseAndStreet: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: Number, required: true },
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (email) {
                return validator.isEmail(email)
            },
            message: props => `${props.value} is not a valid email`
        }
    },
    default: { type: Boolean }
})

module.exports = mongoose.model('address', addressSchema)