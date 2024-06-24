const mongoose = require('mongoose')
const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const Product = require('../../model/product')
const Cart = require('../../model/cart')
const fs = require('fs')
const path = require('path')
const { error } = require('console')

module.exports = {
    showProducts: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            const products = await Product.find({ disabled: false }).limit(20)
            const allProducts = await Product.find({ disabled: false }).count()
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            const productLength = Math.ceil(allProducts / 20)
            res.render('user/products', { title: 'products', products, categories, productLength, subCategories, cartLength })
        } catch (err) {
            console.log(err.message)
        }
    },
    showProductsBySubCategory: async (req, res) => {
        const { subCategoryId } = req.params
        console.log(subCategoryId)
        const products = await Product.find({ subCategory: subCategoryId }).limit(20)
    },
    showHome: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            const productLength = await Product.find().count()
            const newProducts = await Product.find().skip(productLength - 8).limit(8)
            res.render('user/home', { title: 'home', categories, subCategories, newProducts, cartLength })
        } catch (err) {
            console.log(err.message)
        }
    },
    getProductsByPagination: async (req, res) => {
        try {
            let { paginationValue, chosenCategoryId } = req.params
            paginationValue = +paginationValue
            const skipFrom = (paginationValue - 1) * 20
            console.log(paginationValue, chosenCategoryId)
            const limitUpto = 20
            let paginationLength
            let sortedProducts
            // console.log(chosenCategoryId)
            if (chosenCategoryId == 'undefined' || chosenCategoryId == 'all') {
                // console.log('entered undefined area')
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
            console.log('user side', err.message)
            return res.json({ error: true, message: 'something went wrong' })
        }
    },
    showProductDetails: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const { productId } = req.params
            // req.session.selectedProductId = productId
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            const productCategoryName = await Product.aggregate([
                { $match: { _id: mongoose.Types.ObjectId.createFromHexString(productId) } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "categoryName"
                    }
                },
                { $unwind: "$categoryName" },
                {
                    $replaceRoot: { newRoot: "$categoryName" }
                },
                {
                    $project: { name: 1, _id: 0 }
                }
            ])
            const categoryName = productCategoryName.length < 1 ? 'Na' : productCategoryName[0].name
            const product = await Product.findOne({ disabled: false, _id: productId })
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            if (product) {
                return res.render('user/productDetails', { title: 'productDetails', categories, subCategories, product, categoryName, cartLength })
            }
            res.json({ error: true, message: 'Error fetching data.' })
        } catch (err) {
            console.log(err.message)
            res.json({ error: 404 })
        }
    },
    showCart: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            const userCartProducts = await Cart.aggregate([
                // { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
                // { $lookup: { from: "products", localField: "products.productId", foreignField: "_id", as: "products" } } 

                {
                    $match: {
                        user: mongoose.Types.ObjectId.createFromHexString(userId)
                    }
                },
                {
                    $unwind: "$products"
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "products.productId",
                        foreignField: "_id",
                        as: "productDetails"
                    }
                },
                {
                    $unwind: "$productDetails"
                },
                {
                    $addFields: {
                        "productDetails.cartQuantity": "$products.quantity"
                    }
                },
                // {$replaceRoot : {newRoot : '$productDetails'}}
            ])
            // const cartProducts = userCartProducts[0].products ? userCartProducts[0].products : null
            // console.log(userCartProducts)
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            res.render('user/cart', { title: 'cart', categories, subCategories, cartLength, userCartProducts })
        } catch (err) {
            res.render('user/404')
        }
    },
    addToCart: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const { productId, quantity } = req.params
            console.log('reached add to cart')
            // const {selectedProductId} = req.session
            // console.log(selectedProductId)
            if (productId) {
                const cart = await Cart.findOne({ user: userId })
                const product = await Product.findOne({ _id: productId })
                const productPrice = product.offerPrice ? product.offerPrice : product.price
                if (quantity > product.stock) {
                    if (product.stock == 0) {
                        return res.json({ success: false, message: `this product is out of stock` })
                    }
                    return res.json({ success: false, message: `Only ${product.stock} remaining` })
                }
                if (cart) {
                    const duplicateProduct = cart.products.find(product => product.productId == productId)
                    if (duplicateProduct) {
                        await Cart.updateOne({ user: userId, 'products.productId': productId }, { $inc: { 'products.$.quantity': quantity, total: productPrice * quantity } })
                        const negativeQuantity = -quantity
                        await Product.updateOne({ _id: productId }, { $inc: { stock: negativeQuantity } })
                        // console.log(cart)
                        const cartProductsStock = cart.products.find(prod => prod.productId== productId)
                        const cartProductsTotalCount = cartProductsStock.quantity + +quantity
                        const productTotal = product.offerPrice ? product.offerPrice * cartProductsTotalCount : product.price * cartProductsTotalCount

                        const totalCartPrice = cart.total + (+quantity * productPrice)
                        res.json({ success: true, message: `Cart updated successsfully.`, productStock: product.stock - quantity , cartProductsTotalCount , productTotal  , totalCartPrice })
                    } else {
                        const newProduct = {
                            quantity,
                            productId
                        }
                        await Cart.updateOne({ user: userId }, { $push: { products: newProduct }, $inc: { total: productPrice * quantity } })
                        const userCart = await Cart.findOne({ user: userId })
                        const cartLength = userCart ? userCart.products.length : 0
                        res.json({ success: true, message: `Product added to Cart successsfully.`, productStock: product.stock - quantity, cartLength })
                    }
                } else {
                    const newCart = new Cart({
                        user: req.session.userId,
                        products: [{ productId, quantity }],
                        total: productPrice * quantity
                    })
                    await newCart.save()
                    const userCart = await Cart.findOne({ user: userId })
                    const cartLength = userCart ? userCart.products.length : 0
                    res.json({ success: true, message: `Cart updated successsfully.`, cartLength })
                }
            } else {
                res.json({ success: false, message: 'Something went wrong.' })
            }
        } catch (err) {
            console.log('add to cart error', err.message)
            res.json({ success: false, message: 404 })
        }

    },
    showCheckOut: (req, res) => {
        res.render('user/checkout')
    }
}