const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name: { required: true, type: String, trim: true },
    price: { required: true, type: Number },
    category: { required: true, type: mongoose.Types.ObjectId, trim: true },
    subCategory: { required: true, type: mongoose.Types.ObjectId, trime: true },
    collection: { required: true, type: mongoose.Types.ObjectId, trim: true },
    stock: { type: Number, required: true },
    description : {type : String , required : true , trim : true},
    offerPrice : {type : Number } , 
    imgUrl : {type : String}
})

module.exports = mongoose.model('products' , productSchema)