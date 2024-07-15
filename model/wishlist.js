const mongoose = require('mongoose')

const wishlistSchema = mongoose.Schema({
    user : {type : mongoose.Types.ObjectId},
    products : [{
        productId : {type : mongoose.Types.ObjectId},
    }]
} , {timestamps : true})

module.exports = Wishlist = mongoose.model('wishlist' , wishlistSchema) 