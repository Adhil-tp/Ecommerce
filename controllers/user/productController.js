const mongoose = require('mongoose')
const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const Product = require('../../model/product')
const Cart = require('../../model/cart')
const Wishlist = require('../../model/wishlist')
const fs = require('fs')
const path = require('path')
const { isDataView } = require('util/types')

module.exports = {
    showProducts: async (req, res) => {
        try {
            console.log(req.query)
            const { subCatId } = req.query
            let products
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            const wishListLength = await Wishlist.findOne({user : userId})

            if (subCatId) {
                products = await Product.find({ disabled: false, subCategory: subCatId })
            } else {
                console.log('no sub cat id')
                products = await Product.find({ disabled: false }).limit(30)
            }
            const allProducts = await Product.find({ disabled: false }).count()
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            const productLength = Math.ceil(allProducts / 30)
            res.render('user/products', { title: 'products', products, categories, productLength, subCategories, cartLength , wishListLength : wishListLength.products.length })
            // console.log('first')
        } catch (err) {
            console.log(err.message)
        }
    },
    showProductsBySubCategory: async (req, res) => {
        const { subCategoryId } = req.params
        console.log(subCategoryId)
        const products = await Product.find({ subCategory: subCategoryId }).limit(30)
    },
    showHome: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const userCart = await Cart.findOne({ user: userId })
            const cartLength = userCart ? userCart.products.length : 0
            const wishListLength = await Wishlist.findOne({user : userId})
            const categories = await category.find({})
            const subCategories = await subCategory.find({})
            const productLength = await Product.find().count()
            const newProducts = await Product.find().skip(productLength - 8).limit(8)
            res.render('user/home', { title: 'home', categories, subCategories, newProducts, cartLength , wishListLength : wishListLength.products.length })
        } catch (err) {
            console.log(err.message)
        }
    },
    getProductsByPagination: async (req, res) => {
        try {
            let { paginationValue, chosenCategoryId } = req.params
            paginationValue = +paginationValue
            const skipFrom = (paginationValue - 1) * 30
            console.log(paginationValue, chosenCategoryId)
            const limitUpto = 30
            let paginationLength
            let sortedProducts
            // console.log(chosenCategoryId)
            if (chosenCategoryId == 'undefined' || chosenCategoryId == 'all') {
                // console.log('entered undefined area')
                sortedProducts = await Product.find({ disabled: false }).skip(skipFrom).limit(limitUpto)
                paginationLength = Math.ceil(await Product.find({ disabled: false }).count() / limitUpto)
                if (sortedProducts) {
                    return res.json({ error: false, sortedProducts, paginationLength })
                }
                return res.status(404).json({ error: true, message: 'No products under the selected field.' })
            }
            sortedProducts = await Product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(chosenCategoryId) }).skip(skipFrom).limit(limitUpto)
            paginationLength = Math.ceil(await Product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(chosenCategoryId) }).count() / 30)
            if (sortedProducts) {
                return res.status(200).json({ error: false, sortedProducts, paginationLength })
            }
            return res.status(404).json({ error: true, message: 'No products under the selected field.' })


        } catch (err) {
            console.log('user side', err.message)
            return res.status(500).json({ error: true, message: 'something went wrong' })
        }
    },
    showProductDetails: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const { productId } = req.params
            // req.session.selectedProductId = productId
            const wishListLength = await Wishlist.findOne({user : userId})
            const userWishlist = await Wishlist.findOne({ user: userId })
            const isInWishlist = userWishlist.products.find(product => productId == product.productId) ? true : false
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
                return res.render('user/productDetails', { title: 'productDetails', categories, subCategories, product, categoryName, cartLength, isInWishlist , wishListLength : wishListLength.products.length })
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
            const wishListLength = await Wishlist.findOne({user : userId})
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
            res.render('user/cart', { title: 'cart', categories, subCategories, cartLength, userCartProducts , wishListLength : wishListLength.products.length })
        } catch (err) {
            res.render('user/404')
        }
    },
    addToCart: async (req, res) => {
        try {
            req.session.userId = '6674772d1b158bc8122ff8ec'
            const { userId } = req.session
            const { productId, quantity } = req.params
            console.log(req.params)

            console.log(quantity)
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

                    if (quantity < 0) {
                        if (duplicateProduct.quantity - Math.abs(quantity) < 0) {
                            return res.json({ success: false, message: `Only ${duplicateProduct.quantity} can be removed.` })
                        }
                    }
                    if (duplicateProduct) {
                        await Cart.updateOne({ user: userId, 'products.productId': productId }, { $inc: { 'products.$.quantity': quantity, total: productPrice * quantity } })
                        const negativeQuantity = -quantity
                        await Product.updateOne({ _id: productId }, { $inc: { stock: negativeQuantity } })
                        // console.log(cart)
                        const cartProductsStock = cart.products.find(prod => prod.productId == productId)
                        const cartProductsTotalCount = cartProductsStock.quantity + +quantity
                        const productTotal = product.offerPrice ? product.offerPrice * cartProductsTotalCount : product.price * cartProductsTotalCount

                        const totalCartPrice = cart.total + (+quantity * productPrice)
                        res.json({ success: true, message: `Cart updated successsfully.`, productStock: product.stock - quantity, cartProductsTotalCount, productTotal, totalCartPrice })
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
    deleteCartProduct: async (req, res) => {
        try {
            const { productId } = req.params
            const { userId } = req.session

            console.log('producct id ', productId, userId)
            const removingProduct = await Product.findOne({ _id: productId })
            const productPrice = removingProduct.offerPrice ? removingProduct.offerPrice : removingProduct.price
            const usersCart = await Cart.aggregate([
                { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
                {
                    $project: {
                        _id: 0,
                        products: {
                            $filter: { input: '$products', as: 'product', cond: { $eq: ['$$product.productId', mongoose.Types.ObjectId.createFromHexString(productId)] } }
                        }
                    }
                },
                { $unwind: '$products' },
                { $replaceRoot: { newRoot: '$products' } },
                { $project: { quantity: 1 } }
            ])
            const productQuantity = usersCart[0]?.quantity
            console.log(productQuantity)
            await Product.updateOne({ _id: productId }, { $inc: { stock: productQuantity } })
            await Cart.updateOne({ user: userId }, { $pull: { products: { productId } }, $inc: { total: -productPrice * productQuantity } })
            res.json({ success: true })
        } catch (err) {
            console.log(err.message)
            res.json({ success: false })
        }
    },
    getProductsByCategory: async (req, res) => {
        try {
            // console.log(req.params)
            const catId = req.params.chosenCategoryId
            console.log(catId)
            if (catId != 'all') {
                const sortedProducts = await Product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(catId) }).limit(30)
                const allProductsLength = await Product.find({ disabled: false, category: mongoose.Types.ObjectId.createFromHexString(catId) }).count()
                // console.log(sortedProducts)
                const paginationLength = Math.ceil(allProductsLength / 30)
                // console.log(categories)
                if (!sortedProducts) {
                    return res.json({ success: false, message: `No categories found with the selected name`, paginationLength })
                }
                console.log('reached sending area')
                return res.json({ success: true, sortedProducts, paginationLength })
            }
            const sortedProducts = await Product.find({ disabled: false }).limit(30)
            const allProducts = await Product.find({ disabled: false }).count()
            const paginationLength = Math.ceil(allProducts / 30)
            if (!sortedProducts) {
                return res.json({ success: false, message: `No categories found with the selected name` })
            }
            return res.json({ success: true, sortedProducts, paginationLength })
        } catch (err) {
            console.log('error ', err.message)
            res.json({ success: false, message: `${err.message}` })
        }
    },
    filterByPrice: async (req, res) => {
        try {
            const { chosenCategoryId, priceRange } = req.params
            const [priceFrom, priceUpTo] = priceRange.split('-').map(price => parseInt(price))
            if (chosenCategoryId != 'undefined') {
                const products = await Product.find({ category: chosenCategoryId, $and: [{ price: { $gt: priceFrom } }, { price: { $lt: priceUpTo } }] }).limit(30)
                if (products.length > 0) {
                    return res.status(200).json({ success: true, sortedProducts: products })
                } else {
                    return res.status(404).json({ success: false, message: 'No products found.' })
                }
            } else {
                const products = await Product.find({ $and: [{ price: { $gt: priceFrom } }, { price: { $lt: priceUpTo } }] })
                if (products.length > 0) {
                    return res.status(200).json({ success: true, sortedProducts: products })
                } else {
                    return res.status(404).json({ success: false, message: 'No products found.' })
                }
            }
        } catch (err) {
            console.log(err.message)
            res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },
    showCheckOut:async (req, res) => {
        const wishListLength = await Wishlist.findOne({user : userId})
        res.render('user/checkout' , { wishListLength : wishListLength.products.length })
    },
    showWishlist: (req, res) => {
        res.render('user/wishlist')
    },
    addToWishlist: async (req, res) => {
        try {
            console.log(req.query)
            const { productId } = req.query
            const { userId } = req.session
            const userWishlist = await Wishlist.findOne({ user: userId })
            if (!userWishlist) {
                const newWishlist = new Wishlist({
                    user: userId,
                    products: [{ productId }]
                })
                await newWishlist.save()
            } else {
                const duplicateProduct = userWishlist.products.find(product => productId == product.productId)
                if (duplicateProduct) {
                    console.log(await Wishlist.findOne({ user: userId }))
                    await Wishlist.updateOne({ user: userId }, { $pull: { products: { productId } } })
                    res.status(200).json({ success: true, isInWishlist: false, wishListLength: userWishlist.products?.length - 1 })
                } else {
                    await Wishlist.updateOne({ user: userId }, { $push: { products: { productId } } })
                    res.status(200).json({ success: true, isInWishlist: true, wishListLength: userWishlist.products?.length + 1 })
                }
            }
        } catch (error) {
            res.status(500).json({ success: false })
        }
    }

}