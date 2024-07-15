const mongoose = require('mongoose')
const category = require('../../model/category')
const subCategory = require('../../model/subCategory')
const collection = require('../../model/collection')
const Product = require('../../model/product')
const Cart = require('../../model/cart')
const Wishlist = require('../../model/wishlist')
const Coupon = require('../../model/coupon')
const Address = require('../../model/address')
const User = require('../../model/user')
const Order = require('../../model/order')
const fs = require('fs')
const path = require('path')
const sendMail = require('../../utils/nodemailer')
const crypto = require("crypto")

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })


const Razorpay = require('razorpay')
const user = require('../../model/user')
const address = require('../../model/address')
const order = require('../../model/order')
const { title } = require('process')

const instance = new Razorpay({
    key_id: process.env?.key_id,
    key_secret: process.env?.key_secret
})



async function showOrders(req, res) {
    try {
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        const orders = await Order.aggregate([
            { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId), status: 'Pending' } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productObject'
                }
            },
            { $unwind: '$productObject' },
            {
                $lookup: {
                    from: 'addresses',
                    localField: 'address',
                    foreignField: '_id',
                    as: 'addressObject'
                }
            },
            { $unwind: { path: '$addressObject', preserveNullAndEmptyArrays: true } },
            { $sort: { orderedDate: -1 } }

        ])
        // console.log(typeof ordersList[0])
        // const orders = ordersList.map(order => order.toObject())

        orders.forEach(object => {
            object.orderedDate = new Date(object.orderedDate).toLocaleDateString('en-GB')
            object.deliveryDate = new Date(object.deliveryDate).toLocaleDateString('en-GB')
        });
        if (!orders.length) {
            res.redirect('/user/home')
        }
        res.render('user/orders', {
            title: 'orders',
            cartLength,
            wishListLength,
            categories,
            subCategories,
            isLoggedIn: req.session?.isLoggedIn,
            orders
        })
    } catch (error) {
        console.log(error.message)
    }
}


async function showProducts(req, res) {
    try {
        // console.log(req.query)
        const { subCatId } = req.query
        let products
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0

        if (subCatId) {
            products = await Product.find({ disabled: false, subCategory: subCatId })
        } else {
            products = await Product.find({ disabled: false }).limit(30)
        }
        const allProducts = await Product.find({ disabled: false }).count()
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        const productLength = Math.ceil(allProducts / 30)
        res.render('user/products', { title: 'products', products, categories, productLength, subCategories, cartLength, wishListLength, isLoggedIn: req.session.isLoggedIn })
        // console.log('first')
    } catch (err) {
        console.log(err.message)
    }
}
async function showHome(req, res) {
    try {
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId, isLoggedIn } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        const productLength = await Product.find().count()
        const newProducts = await Product.find().skip((productLength - 8) > 0 ? productLength - 8 : 0).limit(8)
        const bestSellers = await Product.find().sort({ sold: -1 }).limit(4)
        res.render('user/home', { title: 'home', categories, subCategories, newProducts, cartLength, wishListLength, isLoggedIn: req.session?.isLoggedIn, bestSellers })
    } catch (err) {
        console.log(err.message)
    }
}
async function showProductsBySubCategory(req, res) {
    const { subCategoryId } = req.params
    const products = await Product.find({ subCategory: subCategoryId }).limit(30)
}
async function getProductsByPagination(req, res) {
    try {
        let { paginationValue, chosenCategoryId } = req.params
        paginationValue = +paginationValue
        const skipFrom = (paginationValue - 1) * 30
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
}
async function showProductDetails(req, res) {
    try {
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const { productId } = req.params
        // req.session.selectedProductId = productId
        const userWishlist = await Wishlist.findOne({ user: userId })
        const wishListLength = userWishlist?.products.length > 0 ? userWishlist.products.length : 0

        const isInWishlist = userWishlist?.products.find(product => productId == product.productId) ? true : false
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
        // console.log(productCategoryName)
        const categoryName = productCategoryName[0].name
        // console.log('first')
        const product = await Product.findOne({ disabled: false, _id: productId })
        const relatedProducts = await Product.find({ collection: product.collection }).limit(8)
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart?.products?.length : 0
        if (product) {
            return res.render('user/productDetails', {
                title: 'productDetails',
                categories,
                subCategories,
                product,
                categoryName,
                cartLength,
                isInWishlist,
                wishListLength,
                relatedProducts,
                isLoggedIn: req.session.isLoggedIn
            })
        }
        res.json({ error: true, message: 'Error fetching data.' })
    } catch (err) {
        console.log('show product details', err.message)
        res.json({ error: 404 })
    }
}
async function showCart(req, res) {
    try {
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const cartLength = userCart ? userCart.products.length : 0
        const userCartProducts = await Cart.aggregate([
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
            }
        ])
        let discounctPrice
        if (userCart) {
            if (userCart.total > 9999) {
                discounctPrice = userCart.total - (userCart.total * (9 / 100))
            }
        }
        const userCoupons = await Coupon.find({ usableFor: userId })
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        res.render('user/cart', { title: 'cart', categories, subCategories, cartLength, total: userCart ? userCart.total : 67676, discounctPrice: discounctPrice ? discounctPrice.toFixed(2) : 0, userCartProducts, wishListLength, userCoupons, isLoggedIn: req.session.isLoggedIn })
    } catch (err) {
        console.log(err.message)
    }
}
async function addToCart(req, res) {
    try {
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const { productId, quantity } = req.params
        if (!req.session.isLoggedIn) {
            return res.status(200).json({ success: false, isLoggedIn: req.session?.isLoggedIn })
        }
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
                    const cartProductsStock = cart.products.find(prod => prod.productId == productId)
                    const cartProductsTotalCount = cartProductsStock.quantity + +quantity
                    const productTotal = product.offerPrice ? product.offerPrice * cartProductsTotalCount : product.price * cartProductsTotalCount

                    const totalCartPrice = cart.total + (+quantity * productPrice)
                    res.json({ success: true, message: `Cart updated successsfully.`, productStock: product.stock - quantity, cartProductsTotalCount, productTotal, totalCartPrice })
                } else {
                    await Product.updateOne({ _id: productId }, { $inc: { stock: -quantity } })
                    const newProduct = {
                        quantity,
                        productId
                    }
                    await Cart.updateOne({ user: userId }, { $push: { products: newProduct }, $inc: { total: productPrice * parseInt(quantity) } })
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
}
async function contactUs(req, res) {
    try {
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        console.log('contact us')
        res.render('user/contactus', {
            title: 'Contact us',
            cartLength,
            wishListLength,
            categories,
            subCategories,
            isLoggedIn: req.session?.isLoggedIn,
        })
    } catch (error) {
        console.log(error.message)
        res.redirect('/user/404')
    }
}
async function aboutUs(req, res) {
    try {
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        res.render('user/aboutus', {
            title: 'Contact us',
            cartLength,
            wishListLength,
            categories,
            subCategories,
            isLoggedIn: req.session?.isLoggedIn,
        })
    } catch (error) {
        console.log(error.message)
        res.redirect('/user/404')
    }
}
async function deleteCartProduct(req, res) {
    try {
        const { productId } = req.params
        const { userId } = req.session

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
        await Product.updateOne({ _id: productId }, { $inc: { stock: productQuantity } })
        await Cart.updateOne({ user: userId }, { $pull: { products: { productId } }, $inc: { total: -productPrice * productQuantity } })
        const total = await Cart.findOne({ user: userId })
        res.json({ success: true, total: total.total })
    } catch (err) {
        console.log(err.message)
        res.json({ success: false })
    }
}
async function getProductsByCategory(req, res) {
    try {
        // console.log(req.params)
        const catId = req.params.chosenCategoryId
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
}
async function filterByPrice(req, res) {
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
}
async function showCheckOut(req, res) {
    try {
        const { productId, quantity } = req.query
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const addresses = await Address.find({ user: userId })

        let products
        const userCoupons = await Coupon.find({ $or: [{ usableFor: userId }, { usableFor: 'all' }] })
        if (productId) {
            products = await Product.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId.createFromHexString(productId)
                    }
                },
                { $addFields: { cartQuantity: parseInt(quantity) } }
            ])

            req.session.quantity = quantity
            req.session.isCartPurchase = false
            req.session.buyingProduct = productId
        } else {
            products = await Cart.aggregate([
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
                {
                    $replaceRoot: { newRoot: '$productDetails' }
                }
            ])
            req.session.userCartProducts = products
            req.session.isCartPurchase = true
        }
        if (!products.length) {
            return res.redirect('/user/home')
        }
        // const user = await User.findOne({ _id: userId })
        const payable = products.reduce((acc, product) => {
            return acc += (product.offerPrice ? product.offerPrice : product.price) * product.cartQuantity
        }, 0)
        // console.log(products)
        req.session.payable = payable > 500 ? payable : payable + 50
        res.render('user/checkout', { title: 'checkout', wishListLength, cartLength, categories, subCategories, products, addresses, userCoupons, isLoggedIn: req.session?.isLoggedIn })
    } catch (err) {
        console.log(err.message)
    }
}
async function addAddress(req, res) {
    try {
        const { firstName, lastName, country, houseAndStreet, city, state, orderNote, email, phone, pin, postOffice } = req.body
        const { payable } = req.session
        const { userId } = req.session

        const userAddress = await Address.find({ user: userId })
        if (userAddress.length <= 5) {
            const newAddress = new Address({ user: userId, ...req.body })
            await newAddress.save()
            res.status(201).json({ success: true, message: "Address created succesfully", newAddress })
        } else {
            res.status(400).json({ success: false, message: `Address limit reached,Try deleting one.` })
        }



    } catch (error) {
        console.log(error.message)
    }
}
async function removeAddress(req, res) {
    try {
        const { addressId } = req.params
        if (addressId) {
            await Address.deleteOne({ _id: addressId })
            res.status(200).json({ success: true, message: 'Address deleted succesfully.' })
        } else {
            res.status(200).json({ success: false, message: 'Unable to proceed the process.' })
        }
    } catch (error) {
        res.json(404).json({ success: false, message: 'Unable to proceed the process.' })
    }
}
async function createOrder(req, res) {
    try {
        const { payable, userId } = req.session
        const Order = await instance.orders.create({
            amount: payable * 100,
            currency: 'INR',
            receipt: `order_rcpt_id_${Date.now()}`,
            partial_payment: false
        })
        res.status(200).json({ success: true, Order })
    } catch (error) {
        res.status(500).json({ success: false })
        console.log(error.message)
        console.log('create order error')
    }
}
async function verifyPayment(req, res) {
    try {
        const { userId, payable } = req.session
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, addressId } = req.body
        const data = `${razorpay_order_id}|${razorpay_payment_id}`
        const key = process.env.key_secret
        const generated_signature = crypto.createHmac('sha256', key).update(data).digest('hex')
        const paymentMethod = (await instance.payments.fetch(razorpay_payment_id)).method
        if (razorpay_signature == generated_signature) {

            try {
                const { userCartProducts } = req.session
                if (req.session.isCartPurchase) {
                    req.session.isCartPurchase = null
                    req.session.userCartProducts = null
                    if (userCartProducts.length) {
                        // const userPurchaseList = await User.findOne({ _id: userId })
                        const DateNow = new Date().toLocaleDateString('en-GB')
                        await User.updateOne(
                            { _id: userId },
                            {
                                $push: {
                                    purchasedProducts: {
                                        $each: userCartProducts.map(product => ({
                                            productId: product._id,
                                            quantity: product.cartQuantity
                                        }))
                                    }
                                },
                                $set: { lastPurchaseDate: DateNow }
                            })
                        for (const product of userCartProducts) {
                            await Product.updateOne({ _id: product._id }, { $inc: { sold: product.cartQuantity } })
                            const newOrder = new Order({
                                user: userId,
                                product: product._id,
                                address: addressId,
                                orderedDate: new Date(Date.now()),
                                deliveryDate: new Date(Date.now() + product.deliveryWithin * 24 * 60 * 60 * 1000),
                                paymentMethod,
                                address: addressId,
                                quantity: product.cartQuantity
                            })
                            console.log('order created', newOrder)
                            await newOrder.save()
                        }
                        await Cart.deleteOne({ user: userId })
                    }
                } else {
                    const { buyingProduct, quantity } = req.session
                    const product = await Product.findOne({ _id: buyingProduct })
                    await User.updateOne({ _id: userId }, { $push: { purchasedProducts: { productId: buyingProduct, quantity } } })
                    const newOrder = new Order({
                        user: userId,
                        product: buyingProduct,
                        address: addressId,
                        orderedDate: new Date(Date.now()),
                        deliveryDate: new Date(Date.now() + product.deliveryWithin * 24 * 60 * 60 * 1000),
                        paymentMethod,
                        address: addressId,
                        quantity
                    })

                    await newOrder.save()
                    const negativeQuantity = -quantity
                    await Product.updateOne({ _id: buyingProduct }, { $inc: { stock: negativeQuantity }, $inc: { sold: quantity } })
                }
                if (req.session?.payable > 10000) {
                    const newCoupon = await new Coupon({
                        code: 'PREMIUMFL40',
                        description: 'ON ONE PURCHASE',
                        discount: 40,
                        usableFor: userId
                    }).save()
                }
                if (req.session?.payable > 4999) {
                    const newCoupon = await new Coupon({
                        code: 'ONEPURCHASE15',
                        description: 'ON ONE PURCHASE',
                        discount: 15,
                        usableFor: userId
                    }).save()
                }
                req.session.payable = null
                await Coupon.deleteOne({ _id: req.session.usedCoupon })
                res.status(202).json({ success: true, message: 'Purchase completed succesfully.' })
            } catch (error) {
                console.log('deleting cart error ', error.message)
                return res.json(200).json({ success: false, message: 'something went wrong' })
            }
            // res.status(202).json({ success: true, message: 'Payment successfull.' })
        } else {
            res.status(403).json({ success: false, message: 'Payment failed.' })
        }
        console.log(req.body)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ success: false, message: 'Internal server error.' })
    }
}
async function addToWishlist(req, res) {
    try {
        if (!req.session.isLoggedIn) {
            return res.status(200).json({ success: false, isLoggedIn: req.session?.isLoggedIn })
        }
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
async function showWishlist(req, res) {
    try {
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const products = await Wishlist.aggregate([
            { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
            { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'products' } },
            { $unwind: '$products' },
            { $replaceRoot: { newRoot: '$products' } }
        ])
        if (!products.length) {
            return res.redirect('/user/home')
        }
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        res.render('user/wishlist', {
            title: 'wishlist',
            products,
            categories,
            subCategories,
            wishListLength,
            cartLength,
            isLoggedIn: req.session?.isLoggedIn
        })
    } catch (error) {
        console.log(error.message)
    }
}
async function useCoupon(req, res) {
    try {
        const { couponId } = req.query
        // req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const couponCheck = await Coupon.findOne({ usableFor: userId, _id: couponId })

        if (req.session.isCouponUsed) {
            const actualAmount = req.session.actualAmount
            req.session.payable = ((actualAmount / 100) * (100 - couponCheck.discount)).toFixed(2)
            res.json({
                success: true,
                payable: req.session.payable,
                actualAmount: req.session.actualAmount,
                discount: couponCheck.discount
            })

        }
        if (couponCheck) {
            const { payable, quantity } = req.session
            req.session.actualAmount = payable
            req.session.payable = ((payable / 100) * (100 - couponCheck.discount)).toFixed(2)
            req.session.usedCoupon = couponId
            req.session.isCouponUsed = true
            res.json({ success: true, payable: req.session.payable, actualAmount: req.session.actualAmount, discount: couponCheck.discount })
        }

    } catch (error) {
        console.log(error.message)
    }
}
async function sendOTP(req, res) {
    try {
        const { email } = req.body
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.mailOTP = {
            otp,
            otpTime: Date.now()
        }
        await sendMail(email, otp)
        res.status(200).json({ success: true, message: 'Otp send succesfully.' })
    } catch (error) {
        res.status(404).json({ success: false, message: 'Error sending Otp.' })
        console.log(error.message)
    }
}
async function verifyOTP(req, res) {
    try {
        const { otp } = req.body
        const mailOTP = req.session.mailOTP

        if (Date.now() - mailOTP?.otpTime >= 50000) {
            return res.status(200).json({ success: false, message: 'Otp time expired. Please re-send otp.' })
        }
        if (otp.trim() == mailOTP.otp) {
            req.session.isMailVerified = true
            res.status(200).json({ success: true, message: 'Verification success.' })
            return
        }
        res.status(200).json({ success: false, message: 'Otp invalid.' })
    } catch (error) {
        res.status(400).json({ success: false, message: 'Something went wrong.' })
    }
}

async function showProfile(req, res) {
    const { userId } = req.session
    const userCart = await Cart.findOne({ user: userId })
    const cartLength = userCart ? userCart.products.length : 0
    const wishList = await Wishlist.findOne({ user: userId })
    const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
    const categories = await category.find({})
    const subCategories = await subCategory.find({})
    const orders = await Order.aggregate([
        { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId), status: 'Pending' } },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'productObject'
            }
        },
        { $unwind: '$productObject' },
        {
            $lookup: {
                from: 'addresses',
                localField: 'address',
                foreignField: '_id',
                as: 'addressObject'
            }
        },
        { $unwind: { path: '$addressObject', preserveNullAndEmptyArrays: true } },
        { $sort: { orderedDate: -1 } }

    ])
    // console.log(typeof ordersList[0])
    // const orders = ordersList.map(order => order.toObject())

    orders.forEach(object => {
        object.orderedDate = new Date(object.orderedDate).toLocaleDateString('en-GB')
        object.deliveryDate = new Date(object.deliveryDate).toLocaleDateString('en-GB')
    });

    const address = await Address.findOne({user : userId})
    res.render('user/my-account', {
        title: 'User profile',
        cartLength,
        wishListLength,
        categories,
        subCategories,
        orders,
        isLoggedIn: req.session?.isLoggedIn,
        address
    })
}


module.exports = {
    showProducts,
    showProductsBySubCategory,
    showOrders,
    showHome,
    getProductsByPagination,
    showProductDetails,
    showCart,
    addToCart,
    deleteCartProduct,
    getProductsByCategory,
    filterByPrice,
    showWishlist,
    addToWishlist,
    addAddress,
    removeAddress,
    showCheckOut,
    createOrder,
    verifyPayment,
    useCoupon,
    sendOTP,
    verifyOTP,
    contactUs,
    aboutUs,
    showProfile
}