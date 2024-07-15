const mongoose = require('mongoose')
const product = require('./product')
const address = require('./address')

const orderSchema = mongoose.Schema({
    user : {type : mongoose.Types.ObjectId , required : true},
    product : {type : mongoose.Types.ObjectId , required : true},
    orderedDate : {type : Date , required : true},
    deliveryDate  : {type : Date , required : true},
    status : {type : String , default : 'Pending'},
    paymentMethod : {type : String , required : true},
    address : {type : mongoose.Types.ObjectId , required : true},
    quantity : {type : Number  , required : true , default : 1}
}  , {timestamps : true})

module.exports = mongoose.model('orders' , orderSchema)