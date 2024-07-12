const addCategoryController = require('../controllers/admin/adminAddCategory')
const productController = require('../controllers/admin/adminAddProduct')
const categoryController = require('../controllers/admin/categoryController')
const adminController = require('../controllers/admin/adminController')
const upload = require('../middlewares/multer')
const auth = require('../middlewares/auth')

const express = require('express')
const router = express.Router()

//routers for rendering pages

router.use(auth.adminCheck)
router.get('/orders', adminController.showOrder)
      .get('/getOrders' , adminController.getOrders)

router.post('/order-update' , adminController.orderUpdate)
      // .post('/deliver-order' , adminController.deliverOrder)

.get('/coupons' , categoryController.showCoupons)
router.get('/showProducts', productController.showProducts)
      .get('/addProduct', productController.getAddProduct)
      .get('/showCategories', categoryController.showCategories)
      .get('/editProduct', productController.editSpecificProductPage)
      .get('/disableProduct' , productController.disableProduct)
      .get('/enableProduct' , productController.enableProduct)
      .get('/showDisabled' , productController.showDisabledPage)


router.get('/api/categorySelect/:categoryId', productController.categorySelect)
      .get('/api/subCategorySelect/:subCategoryId', productController.subCategorySelect)
      .get('/api/getProductByCategory/:categoryId', productController.getProductsByCategory)
      .get('/api/getProductsByPagination/:paginationValue/:chosenCategoryId', productController.getProductsByPagination)
      .get('/api/searchingProducts/:searchValue', productController.searchProduct)

router.post('/api/addProduct', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'detailedImages', maxCount: 10 }]),
      productController.addProduct)

router.put('/api/updateProduct', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'newDetailedImages', maxCount: 10 }]),
      productController.updateProduct)




router.post('/api/createCategory/:categoryName', addCategoryController.createCategory)
      .post('/api/changeCategoryName/:categoryName', addCategoryController.changeCategoryName)
      .post('/api/addSubCategory/:subCategoryName', addCategoryController.createSubCategory)
      .post('/api/createCollection/:collectionName/:chosenSubCategoryId', addCategoryController.createCollection)
      .post('/api/deleteUnsavedCategory', addCategoryController.deleteUnsavedCategory)
// .post('/checking' , addCategoryController.checking)

router.get('/api/changeSubCategory/:chosenSubCategoryId', addCategoryController.changeSubCategory)





router.delete('/api/deleteCollection/:collectionId', categoryController.deleteCollection)
      .delete('/api/deleteSubCat/:subCategoryId', categoryController.deleteSubCategory)


router.put('/api/editCollectionName/:collectionId/:newCollectionName', categoryController.editCollectionName)
      .put('/api/editSubCategoryName/:subCategoryId/:newSubCatName', categoryController.editSubCategoryName)



module.exports = router