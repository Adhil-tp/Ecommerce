const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const product = require('../../model/product')
const mongoose = require('mongoose')
const fs = require('fs')
const { measureMemory } = require('vm')


module.exports = categoryController = {
    showCategories: async (req, res) => {
        try {
            const categories = await category.find({})

            res.render('admin/categories', { title: 'showCategories', categories })
        } catch (err) {
            console.log(err.message)
        }
    },
    deleteCollection: async (req, res) => {
        try {
            // console.log('this is collection id', req.params)
            const collectionId = req.params.collectionId
            try {
                await product.deleteMany({ collection: mongoose.Types.ObjectId.createFromHexString(collectionId) })
                await collection.deleteOne({ _id: collectionId })
                res.json({ error: false , message : 'Collection deleted succesfully.' })
            } catch (err) {
                console.log('err' , err.message)
                res.json({ error: true, message: 'something went wrong.' })
            }
        } catch (err) {
            res.json({ error: true, message: 'something went wrong.' })
        }

    },
    createCollecion : async (req , res) => {
        try{
            console.log(req.params)
            const newCategoryName = req.params.newCollectionName.toUpperCase().trim()
            console.log(newCategoryName)
            const foundedCollection = await collection.findOne({name : newCategoryName})
            if(!foundedCollection){
                const newCollection = new collection({
                    name : newCategoryName ,
                    
                })
            }
        }catch(err){
            res.json({error : true , message: 'Something went wrong.'})
        }
    },
    deleteSubCategory : async (req , res) => {
        try{
            const subCategoryId = req.params.subCategoryId
            await collection.deleteMany({subCategoryId : subCategoryId})
            await subCategory.deleteOne({_id : subCategoryId})
            res.json({error : false , message: "Sub category deleted succesfully."})

        }catch(err) {
            console.log(err.message)
            res.json({error : true , message: "something went wrong"})
        }
    }
}