const express = require('express')
const userController  = require('../../controllers/user/productController')

const userRouter = express.Router()

userRouter.get('/showProducts' , userController.showProducts )
    .get('/productDetails/:productId' , userController.showProductDetails)
    .get('/home' , userController.showHome )
    .get('/api/getProductsByPagination/:paginationValue/:chosenCategoryId' , userController.getProductsByPagination)
    .get('/showProductsBySubCategory/:subCategoryId' , userController.showProductsBySubCategory)
    .get('/cart' , userController.showCart)
    .get('/checkout' , userController.showCheckOut)
    .get('/wishlist' , userController.showWishlist)
    .get(`/api/getProductByCategory/:chosenCategoryId` , userController.getProductsByCategory)
    .get('/api/filterByPrice/:chosenCategoryId/:priceRange' , userController.filterByPrice)
    
userRouter.delete('/deleteCartProduct/:productId' , userController.deleteCartProduct)


userRouter.post('/addToCart/:productId/:quantity' , userController.addToCart)
    .post('/addToWishlist'  , userController.addToWishlist)

module.exports = userRouter