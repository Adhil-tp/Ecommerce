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
const { isDataView } = require('util/types')
const wishlist = require('../../model/wishlist')
const product = require('../../model/product')
const sendMail = require('../../config/nodemailer')
const crypto = require("crypto")

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })


const Razorpay = require('razorpay')
const { send, disconnect } = require('process')
const user = require('../../model/user')
const address = require('../../model/address')

const instance = new Razorpay({
    key_id: process.env?.key_id,
    key_secret: process.env?.key_secret
})



async function showProducts(req, res) {
    try {
        // console.log(req.query)
        const { subCatId } = req.query
        let products
        req.session.userId = '66861c0a218cd412aa16c9b5'
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
        res.render('user/products', { title: 'products', products, categories, productLength, subCategories, cartLength, wishListLength })
        // console.log('first')
    } catch (err) {
        console.log(err.message)
    }
}

async function showHome(req, res) {
    try {
        req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})
        const productLength = await Product.find().count()
        const newProducts = await Product.find().skip(productLength - 8).limit(8)
        res.render('user/home', { title: 'home', categories, subCategories, newProducts, cartLength, wishListLength })
    } catch (err) {
        console.log(err)
    }
}

async function showProductsBySubCategory(req, res) {
    const { subCategoryId } = req.params
    console.log(subCategoryId)
    const products = await Product.find({ subCategory: subCategoryId }).limit(30)
}

async function getProductsByPagination(req, res) {
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
}
async function showProductDetails(req, res) {
    try {
        req.session.userId = '66861c0a218cd412aa16c9b5'
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
        const userCart = await Cart.findOne({ user: userId })
        // console.log(userCart)
        const cartLength = userCart ? userCart?.products?.length : 0
        if (product) {
            return res.render('user/productDetails', { title: 'productDetails', categories, subCategories, product, categoryName, cartLength, isInWishlist, wishListLength })
        }
        res.json({ error: true, message: 'Error fetching data.' })
    } catch (err) {
        console.log('show product details', err.message)
        res.json({ error: 404 })
    }
}
async function showCart(req, res) {
    try {
        req.session.userId = '66861c0a218cd412aa16c9b5'
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
        res.render('user/cart', { title: 'cart', categories, subCategories, cartLength, total: userCart ? userCart.total : 67676, discounctPrice: discounctPrice ? discounctPrice.toFixed(2) : 0, userCartProducts, wishListLength, userCoupons })
    } catch (err) {
        console.log(err.message)
    }
}
async function addToCart(req, res) {
    try {
        req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const { productId, quantity } = req.params
        console.log('product id and quantity', productId, quantity)

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
                console.log('cart exist')
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
                    console.log(cartProductsStock)
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

async function deleteCartProduct(req, res) {
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
        console.log('user cart', usersCart)
        const productQuantity = usersCart[0]?.quantity
        console.log('product Quantity', productQuantity)
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
        req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const addresses = await Address.find({ user: userId })

        let products
        const userCoupons = await Coupon.find({$or : [{usableFor : userId} , {usableFor  : 'all'}]})
        console.log(userCoupons)
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
        const user = await User.findOne({ _id: userId })
        const payable = products.reduce((acc, product) => {
            return acc += (product.offerPrice ? product.offerPrice : product.price) * product.cartQuantity
        }, 0)
        // console.log(products)
        req.session.payable = payable > 500 ? payable : payable + 50
        res.render('user/checkout', { title: 'checkout', wishListLength, cartLength, categories, subCategories, products, addresses, userCoupons })
    } catch (err) {
        console.log(err.message)
    }
}

async function addAddress(req, res) {
    try {
        console.log(req.body)
        console.log('here')
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
        console.log(razorpay_signature, generated_signature)
        const paymentMethod = (await instance.payments.fetch(razorpay_payment_id)).method
        console.log('pay method', paymentMethod)
        if (razorpay_signature == generated_signature) {

            try {
                const { userCartProducts } = req.session
                if (req.session.isCartPurchase) {
                    console.log('use cart products ', userCartProducts)
                    await Cart.deleteOne({ user: userId })
                    req.session.isCartPurchase = null
                    req.session.userCartProducts = null
                    if (userCartProducts.length) {
                        // const userPurchaseList = await User.findOne({ _id: userId })
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
                                $set: { lastPurchaseDate: new Date().toLocaleString('en-GB') }
                            })
                        for (const product of userCartProducts) {
                            // const currentDate = Date.now().toLocaleString('en-GB')
                            const newOrder = new Order({
                                user: userId,
                                product: product._id,
                                address: addressId,
                                orderedDate: new Date().toLocaleString('en-GB'),
                                deliveryDate: new Date(Date.now() + product.deliveryWithin * 24 * 60 * 60 * 1000),
                                paymentMethod,
                                address: addressId,
                                quantity: product.cartQuantity
                            })
                            console.log('order created')
                            await newOrder.save()
                        }
                    }
                } else {
                    console.log('buyin product')
                    const { buyingProduct, quantity } = req.session
                    console.log('buying', quantity)
                    const product = await Product.findOne({ _id: buyingProduct })
                    await User.updateOne({ _id: userId }, { $push: { purchasedProducts: { productId: buyingProduct, quantity } } })
                    const newOrder = new Order({
                        user: userId,
                        product: buyingProduct,
                        address: addressId,
                        orderedDate: new Date().toLocaleString('en-GB'),
                        deliveryDate: new Date(Date.now() + product.deliveryWithin * 24 * 60 * 60 * 1000),
                        paymentMethod,
                        address: addressId,
                        quantity
                    })

                    await newOrder.save()
                    console.log('paying ', req.session.payable)
                    const negativeQuantity = -quantity
                    console.log(quantity, buyingProduct, negativeQuantity, typeof negativeQuantity)
                    await Product.updateOne({ _id: buyingProduct }, { $inc: { stock: negativeQuantity } })
                }
                if (req.session?.payable > 10000) {
                    console.log('new coupon creating ')
                    const newCoupon = await new Coupon({
                        code: 'PREMIUMFL40',
                        description: 'ON ONE PURCHASE',
                        discount: 40,
                        usableFor: userId
                    }).save()
                }
                if (req.session?.payable > 4999) {
                    console.log('new coupon creating ')
                    const newCoupon = await new Coupon({
                        code: 'ONEPURCHASE15',
                        description: 'ON ONE PURCHASE',
                        discount: 15,
                        usableFor: userId
                    }).save()
                }
                req.session.payable = null
                console.log('coupon used', req.session.usedCoupon)
                await Coupon.deleteOne({ _id: req.session.usedCoupon })

            } catch (error) {
                console.log('deleting cart error ', error.message)
            }
            res.status(202).json({ success: true, message: 'Payment successfull.' })
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
async function getLogin(req, res) {

    res.render('user/login', { title: 'login' })
}
async function showWishlist(req, res) {
    try {
        req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const products = await Wishlist.aggregate([
            { $match: { user: mongoose.Types.ObjectId.createFromHexString(userId) } },
            { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'products' } },
            { $unwind: '$products' },
            { $replaceRoot: { newRoot: '$products' } }
        ])
        const userCart = await Cart.findOne({ user: userId })
        const cartLength = userCart ? userCart.products.length : 0
        const wishList = await Wishlist.findOne({ user: userId })
        const wishListLength = wishList?.products.length > 0 ? wishList.products.length : 0
        const categories = await category.find({})
        const subCategories = await subCategory.find({})

        res.render('user/wishlist', { title: 'wishlist', products, categories, subCategories, wishListLength, cartLength })
    } catch (error) {
        console.log(error.message)
    }
}

async function useCoupon(req, res) {
    try {
        const { couponId } = req.query
        req.session.userId = '66861c0a218cd412aa16c9b5'
        const { userId } = req.session
        const couponCheck = await Coupon.findOne({ usableFor: userId, _id: couponId })

        if (req.session.isCouponUsed) {
            const actualAmount = req.session.actualAmount
            console.log('actual  aoutn', actualAmount)
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



module.exports = {
    showProducts,
    showProductsBySubCategory,
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
    getLogin,
    addAddress,
    removeAddress,
    showCheckOut,
    createOrder,
    verifyPayment,
    useCoupon,

}