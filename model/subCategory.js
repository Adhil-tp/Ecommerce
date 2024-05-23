const mongoose = require('mongoose')


const subCategorySchema = mongoose.Schema({
    name : {type : String  , required : true}  ,
    categoryId : {type : mongoose.Types.ObjectId , required : true}
})

module.exports = mongoose.model('subCategories' , subCategorySchema)