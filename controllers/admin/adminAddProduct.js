    const category = require('../../model/category')
    const subCategory = require('../../model/subCategory')
    const collection = require('../../model/collection')
    const product = require('../../model/product')
    const mongoose = require('mongoose')
    const fs = require('fs')


module.exports = {
    getAddProduct: async (req, res) => {
        try {
            const categories = await category.find({ name: { $exists: true } })
            // console.log( categories )
            if (categories.length == 0) {
                return res.render('admin/add-product', { categories: [], subCategories: [], collections: [], title: 'add-product' })
            }
            // console.log(categories[0]._id)
            const categoryId = categories[0]._id.toString()
            // console.log('id ', categoryId)
            const subCategories = await subCategory.find({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            // console.log(subCategories)
            const subCategoryId = subCategories[0]._id.toString()
            const collections = await collection.find({ subCategoryId: mongoose.Types.ObjectId.createFromHexString(subCategoryId) })



            res.render('admin/add-product', { categories, subCategories, collections, title: 'add-product' })
        } catch (err) {
            console.log('get add product error ', err.message)
        }
    },
    addProduct: async (req, res) => {
        const errors = {}

        const deleteFiles = (file) => {
            fs.unlink(file, (err) => {
                if (err) {
                    console.log(`error deleting ${file.name}`, err.message)
                }
            })
        }

        const { name, description, category, subCategory, collection, color, size } = req.body
        let { price, stock, offerPrice, deliveryWithin } = req.body

        const productImage = req.files.productImage ? req.files.productImage[0] : null
        const detailedImages = req.files.detailedImages || []

        console.log(productImage)
        console.log(detailedImages)
        // console.log('these are data',name , description , category , subCategory , collection , price , stock  ,productImage , detailedImages)
        const deleteImages = () => {
            if (productImage) {
                deleteFiles(productImage.path)
                console.log(`deleted main image ${productImage.originalname}`)
            }
            if (detailedImages.length >= 1) {
                for (let image of detailedImages) {
                    deleteFiles(image.path)
                    console.log(`deleted ${image.originalname}`)
                }
            }
        }
        if (!productImage) {
            errors.emptyImage = 'choose a image'
        }
        // console.log('product image ', productImage)
        // console.log('imagees ', detailedImages)
        if (detailedImages.length < 3) {
            errors.imagesError = 'Choose atleast 3 images'
        }

        if (name == '') {
            errors.nameError = 'Name is required'
        } else if (name.length < 3) {
            errors.nameError = 'Name must be atleast 3 letters'
        }

        if (description == '') {
            errors.descError = 'Description is required'
        } else if (description.length < 20) {
            errors.descError = 'Brief description required'
        }

        stock = +stock
        if (!stock) {
            errors.stockError = 'Enter a valid stock number'
        }

        //price validation 
        // console.log( +price)
        price = +price
        if (!price) {
            if (price == 0) {
                errors.priceError = 'Enter a valid amount'
            } else {
                errors.priceError = 'Enter a number'
            }
        }

        if (Object.keys(errors).length > 0) {
            deleteImages()
            return res.json({ error: true, errorObj: errors })
        }

        const newDetailedImages = detailedImages.map(element => {
            return `${element.filename}`
        })

        console.log('detailed images ', newDetailedImages)

        const newProduct = {
            name: name.toUpperCase(),
            description,
            category,
            subCategory,
            collection,
            price,
            offerPrice,
            stock,
            color,
            size,
            deliveryWithin,
            mainImage: `${productImage.filename}`,
            detailedImages: newDetailedImages
        }
        console.log(newProduct)
        console.log('reached creating area')

        const newProductCreate = new product(newProduct)
        await newProductCreate.save()
        console.log(`new product created ${newProductCreate}`)
        res.json({ error: false })
    },


    categorySelect: async (req, res) => {
        try {
            // console.log(req.params)
            const categoryId = req.params.categoryId.toString()
            req.session.newCategoryId = categoryId
            const foundedCategory = await category.findOne({_id : mongoose.Types.ObjectId.createFromHexString(categoryId)})
            const foundedSubCats = await subCategory.find({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            const firstSubCat = foundedSubCats[0]._id.toString()
            // console.log(firstSubCat)
            const foundedCollections = await collection.find({ subCategoryId: mongoose.Types.ObjectId.createFromHexString(firstSubCat) })
            // console.log('this is founded collections ', foundedSubCats)
            if (foundedSubCats) {
                console.log('reached category edit page')
                return res.json({ error: false, foundedSubCats, foundedCollections ,foundedCategory })
            }
            res.json({ error: true, message: 'No sub categories belongs to the chosen category' })
        }
        catch (err) {
            res.json({ error: true, message: err.message })
        }
    },
    subCategorySelect: async (req, res) => {
        try {
            console.log(req.params)
            const subCategoryId = req.params.subCategoryId
            foundedSubCategories = await collection.find({ subCategoryId: mongoose.Types.ObjectId.createFromHexString(subCategoryId) })
            if (foundedSubCategories) {
                return res.json({ error: false, foundedSubCategories })
            }
            res.json({ error: true, message: 'something went wrong ' })
        } catch (err) {
            console.log('errr')
        }
    },

    showProducts: async (req, res) => {
        const products = await product.find({})
        const categories = await category.find({})
        // console.log(products)
        res.render('admin/showProducts', { title: 'showProducts', products, categories })
    },
    getProductsByCategory: async (req, res) => {
        try {
            // console.log(req.params)
            const catId = req.params.categoryId
            if(catId != 'all'){
                const products = await product.find({ category: mongoose.Types.ObjectId.createFromHexString(catId) })
                // console.log(categories)
                if (!products) {
                    return res.json({ error: true, message: `No categories found with the selected name` })
                }
                return res.json({ error: false, products })
            }
            const products = await product.find({})
            if (!products) {
                return res.json({ error: true, message: `No categories found with the selected name` })
            }
            return res.json({ error: false, products })
        } catch (err) {
            console.log('error ', err.message)
            res.json({ error: true, message: `${err.message}` })
        }
    }

}