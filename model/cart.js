const mongoose = require('mongoose')

const productSchema = mongoose.Schema(
    {
        quantity: { type: Number, required: true },
        productId: { type: mongoose.Types.ObjectId, required: true , unique : true }
    }
)

const cartSchema = mongoose.Schema({
    user: { type: mongoose.Types.ObjectId, required: true },
    products: [productSchema] , 
    total:{type : Number , required : true , default : 0 }
})

const Cart = mongoose.model('carts' , cartSchema)
module.exports = Cart