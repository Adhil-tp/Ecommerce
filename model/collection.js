const mongoose = require('mongoose')

const collectionSchema = mongoose.Schema({
    name: { type: String, required: true },
    subCategoryId: { type: mongoose.Types.ObjectId, required: true } ,
    categoryId : {type : mongoose.Types.ObjectId , required : true}
})


module.exports = mongoose.model('collections', collectionSchema)