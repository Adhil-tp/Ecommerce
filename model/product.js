const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name: { required: true, type: String, trim: true },
    description: { type: String, required: true, trim: true },
    category: { required: true, type: mongoose.Types.ObjectId, trim: true },
    subCategory: { required: true, type: mongoose.Types.ObjectId, trime: true },
    collection: { required: true, type: mongoose.Types.ObjectId, trim: true },
    stock: { type: Number, required: true },
    price: { required: true, type: Number },
    offerPrice: { type: Number },
    mainImage: { type: String, required: true },
    detailedImages: { type: [String], required: true },
    color : {type : String },
    size : {type : String },
    deliveryWithin : {type : Number}
})

module.exports = mongoose.model('products', productSchema)