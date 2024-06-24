const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const product = require('../../model/product')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')


module.exports = {
    getAddProduct: async (req, res) => {
        try {
            const categories = await category.find({ name: { $exists: true } })
            // console.log( categories )
            if (categories.length == 0) {
                return res.render('admin/add-product', { categories: [], subCategories: [], collections: [], title: 'add-product' })
            }
            // console.log(categories)
            const categoryId = categories[0]?._id.toString()
            // console.log('id ', categoryId)
            const subCategories = await subCategory.find({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            const subCategoryId = subCategories[0]?._id.toString()
            // console.log(subCategoryId)

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

        // console.log(productImage)
        // console.log(detailedImages)
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
        // console.log(newProduct)
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
            const foundedCategory = await category.findOne({ _id: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            const foundedSubCats = await subCategory.find({ categoryId: mongoose.Types.ObjectId.createFromHexString(categoryId) })
            const firstSubCat = foundedSubCats[0]._id.toString()
            // console.log(firstSubCat)
            const foundedCollections = await collection.find({ subCategoryId: mongoose.Types.ObjectId.createFromHexString(firstSubCat) })
            // console.log('this is founded collections ', foundedSubCats)
            if (foundedSubCats) {
                console.log('reached category edit page')
                return res.json({ error: false, foundedSubCats, foundedCollections, foundedCategory })
            }
            res.json({ error: false, message: 'No sub categories belongs to the chosen category' })
        }
        catch (err) {
            console.log('errr ', err.message)
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
        try {
            const products = await product.find({ disabled: false }).limit(20)
            const allProducts = await product.find({ disabled: false }).count()
            const categories = await category.find({})
            const productLength = Math.ceil(allProducts / 20)
            res.render('admin/showProducts', { title: 'showProducts', products, categories, productLength })
        } catch (err) {
            console.log(err.message)
        }
    },
    getProductsByCategory: async (req, res) => {
        try {
            // console.log(req.params)
            const catId = req.params.categoryId
            if (catId != 'all') {
                const sortedProducts = await product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(catId) }).limit(20)
                const allProductsLength = await product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(catId) }).count()
                // console.log(sortedProducts)
                const paginationLength = Math.ceil(allProductsLength / 20)
                // console.log(categories)
                if (!sortedProducts) {
                    return res.json({ error: true, message: `No categories found with the selected name`, paginationLength })
                }
                console.log('reached sending area')
                return res.json({ error: false, sortedProducts, paginationLength })
            }
            const sortedProducts = await product.find({ disabled: false }).limit(20)
            const allProducts = await product.find({ disabled: false }).count()
            const paginationLength = Math.ceil(allProducts / 20)
            if (!sortedProducts) {
                return res.json({ error: true, message: `No categories found with the selected name` })
            }
            return res.json({ error: false, sortedProducts, paginationLength })
        } catch (err) {
            console.log('error ', err.message)
            res.json({ error: true, message: `${err.message}` })
        }
    },
    getProductsByPagination: async (req, res) => {
        try {
            let { paginationValue, chosenCategoryId } = req.params
            paginationValue = +paginationValue
            const skipFrom = (paginationValue - 1) * 20
            const limitUpto = 20
            let paginationLength
            let sortedProducts
            if (chosenCategoryId == 'undefined' || chosenCategoryId == 'all') {
                sortedProducts = await product.find({ disabled: false }).skip(skipFrom).limit(limitUpto)
                paginationLength = Math.ceil(await product.find({ disabled: false }).count() / limitUpto)
                if (sortedProducts) {
                    return res.json({ error: false, sortedProducts, paginationLength })
                }
                return res.json({ error: true, message: 'No products under the selected field.' })
            }
            sortedProducts = await product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(chosenCategoryId) }).skip(skipFrom).limit(limitUpto)
            paginationLength = Math.ceil(await product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(chosenCategoryId) }).count() / 20)
            if (sortedProducts) {
                return res.json({ error: false, sortedProducts, paginationLength })
            }
            return res.json({ error: true, message: 'No products under the selected field.' })


        } catch (err) {
            console.log(err.message)
            return res.json({ error: true, message: 'something went wrong' })
        }

    },
    searchProduct: async (req, res) => {
        try {
            const { searchValue } = req.params
            const searchValueArray = searchValue.split(' ').join('|')
            const searchResult = await product.find({ disabled: false, name: new RegExp(searchValueArray, 'i') }).limit(10)
            if (!searchResult.length) {
                return res.json({ error: true, message: 'No results found.', dataLength: 0 })
            }
            res.json({ error: false, searchResult })
        } catch (err) {
            console.log(err.message)
            res.json({ error: true, message: 'Something went wrong.' })
        }
    },
    editSpecificProductPage: async (req, res) => {
        try {
            const productId = req.query.productId
            req.session.updatingImgID = productId
            const productDetails = await product.findOne({ _id: productId })
            const categories = await category.find({})
            const subCategories = await subCategory.find({ categoryId: productDetails.category })
            const collections = await collection.find({ subCategoryId: productDetails.subCategory })

            res.render('admin/productDetails', { productDetails, title: 'editProduct', categories, subCategories, collections })
        }
        catch (err) {
            res.send('something went wrong')
        }
    },
    updateProduct: async (req, res) => {
        try {
            const deleteFiles = (file) => {
                const rootPath = `${path.join(__dirname, `../../public/images/products/`)}`
                console.log('deleting file', file)
                fs.unlink(`${rootPath}${file}`, (err) => {
                    if (err) {
                        console.log(`error deleting ${file}`, err.message)
                    }
                })
            }
            const deleteImages = () => {
                if (productImage) {
                    deleteFiles(productImage.filename)
                    console.log(`deleted main image ${productImage.originalname}`)
                }
                if (newDetailedImages.length >= 1) {
                    for (let image of detailedImages) {
                        deleteFiles(image.filename)
                        console.log(`deleted ${image.originalname}`)
                    }
                }
            }
            const errors = {}
            const { updatingImgID } = req.session
            const chosenProduct = await product.findOne({ _id: updatingImgID })


            const { name, description, category, subCategory, collection, color, size, detailedImages } = req.body
            let { deletedImages } = req.body
            console.log('deleted images', deletedImages)
            if (deletedImages) {
                deletedImages = deletedImages.split()
            }
            let { price, stock, offerPrice, deliveryWithin } = req.body
            if (deletedImages && deletedImages.length > 0) {
                for (img of deletedImages) {
                    deleteFiles(img)
                }
            }

            const productImage = req.files.productImage ? req.files.productImage[0] : chosenProduct.mainImage
            const newDetailedImages = req.files.newDetailedImages || []
            if (productImage.filename) {
                deleteFiles(chosenProduct.mainImage)
                await product.updateOne({ _id: updatingImgID }, { mainImage: productImage.filename })
            }

            if (detailedImages) {
                await product.updateOne({ _id: updatingImgID }, { $set: { detailedImages: detailedImages } })
            }
            if (newDetailedImages) {
                for (let img of newDetailedImages) {
                    await product.updateOne({ _id: updatingImgID }, { $push: { detailedImages: img.filename } })
                }
            }


            ///validation start here

            if (!productImage) {
                errors.emptyImage = 'choose a image'
            }
            // console.log('product image ', productImage)
            // console.log('imagees ', detailedImages)
            if (detailedImages && detailedImages.length < 3) {
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
            await product.updateOne({ _id: updatingImgID }, {
                $set: {
                    name: name.toUpperCase(),
                    description,
                    category,
                    subCategory,
                    collection,
                    price,
                    stock,
                    offerPrice,
                    color,
                    size,
                    deliveryWithin
                }
            })
            res.json({ error: false })
            // console.log(prod)
            console.log(req.body)
        } catch (err) {
            console.log(err.message)
        }

    },
    disableProduct: async (req, res) => {
        try {
            const { productId } = req.query
            await product.updateOne({ _id: productId }, { disabled: true })
            res.redirect('/admin/showProducts')
        } catch (err) {
            console.log(err.message)
            res.json({ error: 404 })
        }
    },
    showDisabledPage: async (req, res) => {
        try {
            const products = await product.find({ disabled: true }).limit(20)
            const allProducts = await product.find({ disabled: true }).count()
            const categories = await category.find({})
            const productLength = Math.ceil(allProducts / 20)
            res.render('admin/showDisabled', { title: 'showProducts', products, categories, productLength })
        } catch (err) {
            console.log(err.message)
        }
    },
    enableProduct : async (req , res) => {
        try {
            const { productId } = req.query
            await product.updateOne({ _id: productId }, { disabled: false })
            res.redirect('/admin/showDisabled')
        } catch (err) {
            console.log(err.message)
            res.json({ error: 404 })
        }
    }

}