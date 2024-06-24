const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const mongoose = require('mongoose')


module.exports = addCategoryController = {
    

    //this api perform the actions to create a new category in the category collections 
    createCategory: async (req, res) => {
        try {
            req.session.isSaved = false

            // console.log(req.params)
            const categoryName = req.params.categoryName.toUpperCase().trim()
            // console.log('trimmed uppercase name', categoryName)
            const foundedCategory = await category.findOne({ name: categoryName })
            // console.log('founded category', foundedCategory)
            if (!foundedCategory) {
                try {
                    const newCategory = new category({ name: categoryName })
                    // console.log('creating new category')
                    await newCategory.save()
                    req.session.newCategoryId = newCategory._id
                    // console.log('this is category id ', req.session.newCategoryId)
                    req.session.subCategories = []
                    return res.json({ error: false, message: 'Category created succesfully', categoryId: newCategory._id  })
                } catch (err) {
                    return res.json({ error: true, message: 'Oops Try again!' })
                }
            }
            // console.log('reached here to send same error')
            res.json({ error: true, message: 'Category with same name exists' })

        }
        catch (err) {
            return res.json({ error: true, message: "Internal server error , please try again" })
        }

    },


    //this api will do operations to edit the category name

    changeCategoryName: async (req, res) => {
        try {
            // console.log(req.session.newCategoryId)
            const newCategoryId = req.session.newCategoryId
            const updatedCategoryName = req.params.categoryName.toUpperCase().trim()
            // console.log('updated uppercase ' , updatedCategoryName)
            const foundedCategory = await category.findOne({ name: updatedCategoryName })
            if (!foundedCategory) {
                try {
                    // console.log('new category id' , newCategoryId)
                    await category.updateOne(
                        { _id: mongoose.Types.ObjectId.createFromHexString(newCategoryId) },
                        { $set: { name: updatedCategoryName } })

                    

                    return res.json({ error: false, message: "Category name edited succesfully"  , categoryId : newCategoryId})
                } catch (err) {
                    res.json({ error: true, message: 'something went wrong.' })
                }
            }
            res.json({ error: true, message: 'Category with same name exists' })

        } catch (err) {
            res.json({ error: true, message: 'Ooops something went wrong.' })
        }
    },

    //this api perform the action to create a new sub category in the sub cat collection with the newly created categories id
    createSubCategory: async (req, res) => {
        const { subCategoryName } = req.params
        subCategoryName.toUpperCase().trim()
        // console.log('req params ', subCategoryName)
        const getSubCategory = await subCategory.findOne({ name: subCategoryName.toUpperCase(), categoryId: req.session.newCategoryId })
        // console.log(getSubCategory)
        if (getSubCategory) {
            // console.log('found duplicate')
            return res.status(200).json({ error: true, message: "sub category name already exists" })
        }
        // console.log('doesn`t found duplicate')
        const newSubCategory = new subCategory({ name: subCategoryName.toUpperCase(), categoryId: req.session.newCategoryId })
        await newSubCategory.save()
        // console.log('typeof', typeof req.session.subCategories)
        try{
            req.session?.subCategories.push(newSubCategory._id.toString())
        }catch(err){
            console.log('cannot push ')
        }
        // console.log('new created sub categories', req.session.subCategories)

        res.status(200).json({ error: false, message: "Sub category created succesfully.", subCategoryId: newSubCategory._id })
    },


    //this api will create a new colleciton if there is no collection with same colleciton exists

    createCollection: async (req, res) => {
        try {
            const { collectionName, chosenSubCategoryId } = req.params
            console.log('first' , req.session.newCategoryId)
            // console.log('this is new collection name and chosen sub cat id', collectionName, chosenSubCategoryId)
            const findCollection = await collection.findOne({
                name: collectionName.toUpperCase(),
                subCategoryId: mongoose.Types.ObjectId.createFromHexString(chosenSubCategoryId)
            })
            // console.log('founded collectio ', findCollection)
            if (!findCollection) {
                const newCollection = new collection({
                    name: collectionName.toUpperCase(),
                    subCategoryId: chosenSubCategoryId,
                    categoryId: req.session.newCategoryId
                })
                // console.log('creating collection ' , newCollection)
                await newCollection.save()
                return res.status(200).json({ error: false, message: 'Collection created succesfully', collectionId: newCollection._id })
            }
            res.status(200).json({ error: true, message: "collection with same name exists" })
        } catch (err) {
            console.log('error occured while creating collection', err.message)
            res.status(404).json({ error: true, message: "server error 404" })
        }
    },

    //this api will fetch all the categories belongs to the selected sub category


    changeSubCategory: async (req, res) => {
        console.log(req.params)
        const { chosenSubCategoryId } = req.params
        req.session.subCategoryId = chosenSubCategoryId
        console.log('req.session.subCategoryId' , req.session.subCategoryId)
        const collectionList = await collection.find({ subCategoryId: mongoose.Types.ObjectId.createFromHexString(chosenSubCategoryId) })
        // console.log('this is the founded collection', collectionList)
        if (collectionList) {
            return res.status(200).json({ foundData: true, collectionList })
        }
        res.status(200).json({ foundData: false })
    },


    deleteUnsavedCategory: async (req, res) => {
        try {
            const rawData = req.body
            // console.log(req.body)
            const categoryId = req.body.categoryId
            await collection.deleteMany({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            await subCategory.deleteMany({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            await category.deleteOne({ _id: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            res.json({ error: false, message: 'Canceled the process' })
        } catch (err) {
            // console.log('error while deleting everything ', err.message)
            res.json({ error: true, message: 'something went wrong!' })
        }
    },

    fetchAllCategories: (req, res) => {
        const categories = category.find({ name: { $exists: true } })
        // console.log('categories ', categories)
    }
}

