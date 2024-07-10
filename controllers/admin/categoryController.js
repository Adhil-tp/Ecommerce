const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const product = require('../../model/product')
const mongoose = require('mongoose')
const fs = require('fs')

// const deleteImages = (imgPath) => {
//     const imagePath = `/images/products/${imgPath}`
//     fs.unlink(imagePath, (err) => {
//         if(err) {
//             console.log('image deleted succesfully')
//         }
//     })
// }

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
                await collection.deleteOne({ _id: collectionId })
                await product.updateMany({collection : collectionId} , {disabled : true})
                res.json({ error: false, message: 'Collection deleted succesfully.' })
            } catch (err) {
                console.log('err', err.message)
                res.json({ error: true, message: 'something went wrong.' })
            }
        } catch (err) {
            res.json({ error: true, message: 'something went wrong.' })
        }

    },
    createCollecion: async (req, res) => {
        try {
            // console.log(req.params)
            const newCategoryName = req.params.newCollectionName.toUpperCase().trim()
            // console.log(newCategoryName)
            const foundedCollection = await collection.findOne({ name: newCategoryName })
            if (!foundedCollection) {
                const newCollection = new collection({
                    name: newCategoryName,

                })
            }
        } catch (err) {
            res.json({ error: true, message: 'Something went wrong.' })
        }
    },
    deleteSubCategory: async (req, res) => {
        try {
            const subCategoryId = req.params.subCategoryId
            await collection.deleteMany({ subCategoryId: subCategoryId })
            await subCategory.deleteOne({ _id: subCategoryId })
            res.json({ error: false, message: "Sub category deleted succesfully." })

        } catch (err) {
            console.log(err.message)
            res.json({ error: true, message: "something went wrong" })
        }
    },
    editCollectionName: async (req, res) => {
        try {
            // console.log(req.params)
            // console.log('edit collection', req.session.subCategoryId)
            const { collectionId, newCollectionName } = req.params
            const subCategoryId = req.session.subCategoryId
            const findingDuplicate = await collection.findOne({ name: newCollectionName, subCategoryId: subCategoryId })
            if (findingDuplicate) {
                return res.json({ error: true, message: 'same collection name exists.' })
            }
            await collection.updateOne({ _id: collectionId, subCategoryId }, { name: newCollectionName.toUpperCase() })
            res.json({ error: false, message: 'Collection name updated succesfully.' })
        } catch (err) {
            res.json({ error: true, message: 'Error updating ' })
            console.log('edit page erro ', err.message)
        }
    },
    editSubCategoryName: async (req, res) => {
        try {
            const { subCategoryId, newSubCatName } = req.params
            const categoryId = req.session.newCategoryId
            const findingDuplicate = await subCategory.findOne({ name: newSubCatName, categoryId })
            if (findingDuplicate) {
                return res.json({ error: true, message: 'same sub category name exists.' })
            }
            await subCategory.updateOne({ _id: subCategoryId, categoryId }, { name: newSubCatName.toUpperCase() })
            res.json({ error: false, message: 'Sub category name updated succesfully.' })
        } catch (err) {
            res.json({ error: true, message: 'Error updating sub category name' })
        }
    },
    showCoupons : async (req ,res)=>{
        res.render('admin/coupons' , {title : 'coupons'})
    }
}