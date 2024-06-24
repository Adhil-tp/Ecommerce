const express = require('express')
const productController  = require('../../controllers/user/productController')

const userRouter = express.Router()

userRouter.get('/showProducts' , productController.showProducts )
    .get('/productDetails/:productId' , productController.showProductDetails)
    .get('/home' , productController.showHome )
    .get('/api/getProductsByPagination/:paginationValue/:chosenCategoryId' , productController.getProductsByPagination)
    .get('/showProductsBySubCategory/:subCategoryId' , productController.showProductsBySubCategory)
    .get('/cart' , productController.showCart)
    .get('/checkout' , productController.showCheckOut)


userRouter.post('/addToCart/:productId/:quantity' , productController.addToCart)

module.exports = userRouter