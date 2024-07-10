const express = require('express')
const userController = require('../controllers/user/userController')
const { check, validationResult } = require('express-validator')
const userRouter = express.Router()

const userValidationRules = [
    check('firstName').notEmpty().withMessage('First name is required'),
    check('lastName').notEmpty().withMessage('Last name is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('pin').isLength(6).withMessage('pin is required'),
    check('houseAndStreet').notEmpty().withMessage('House and Street is required'),
    check('district').notEmpty().withMessage('District is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('postOffice').notEmpty().withMessage('Post office is required'),
    // check('orderNote').notEmpty().withMessage('Order note is required'),
    check('email').isEmail().withMessage('Email is not valid'),
    check('phone').isLength({ min: 10, max: 10 }).withMessage('Phone number must be between 10 and 15 digits')
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};

userRouter.get('/showProducts', userController.showProducts)
    .get('/productDetails/:productId', userController.showProductDetails)
    .get('/home', userController.showHome)
    .get('/api/getProductsByPagination/:paginationValue/:chosenCategoryId', userController.getProductsByPagination)
    .get('/showProductsBySubCategory/:subCategoryId', userController.showProductsBySubCategory)
    .get('/cart', userController.showCart)
    .get('/checkout', userController.showCheckOut)
    .get('/wishlist', userController.showWishlist)
    .get(`/api/getProductByCategory/:chosenCategoryId`, userController.getProductsByCategory)
    .get('/api/filterByPrice/:chosenCategoryId/:priceRange', userController.filterByPrice)
    .get('/login', userController.getLogin)

userRouter.delete('/deleteCartProduct/:productId', userController.deleteCartProduct)
            .delete('/removeAddress/:addressId' , userController.removeAddress)


userRouter.post('/addToCart/:productId/:quantity', userController.addToCart)
    .post('/addToWishlist', userController.addToWishlist)
    .post('/addAddress', userValidationRules, validate, userController.addAddress)
    .post('/create-order', userController.createOrder)
    .post('/payment/verify-payment', userController.verifyPayment)
    .post('/useCoupon' , userController.useCoupon)

module.exports = userRouter