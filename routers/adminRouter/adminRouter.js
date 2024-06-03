const addCategoryController = require('../../controllers/admin/adminAddCategory')
const productController = require('../../controllers/admin/adminAddProduct')
const categoryController = require('../../controllers/admin/categoryController')
const upload = require('../../middlewares/multer')

const express = require('express')
const router = express.Router()

router.get('/addProduct', productController.getAddProduct)
      .get('/api/categorySelect/:categoryId', productController.categorySelect)
      .get('/api/subCategorySelect/:subCategoryId', productController.subCategorySelect)
      .get('/api/getProductByCategory/:categoryId', productController.getProductsByCategory)
      .get('/showProducts', productController.showProducts)




router.post('/api/createCategory/:categoryName', addCategoryController.createCategory)
      .post('/api/changeCategoryName/:categoryName', addCategoryController.changeCategoryName)
      .post('/api/addSubCategory/:subCategoryName', addCategoryController.createSubCategory)
      .post('/api/createCollection/:collectionName/:chosenSubCategoryId', addCategoryController.createCollection)
      .post('/api/deleteUnsavedCategory', addCategoryController.deleteUnsavedCategory)
// .post('/checking' , addCategoryController.checking)

router.get('/api/changeSubCategory/:chosenCollectionParent', addCategoryController.changeSubCategory)



router.get('/showCategories', categoryController.showCategories)


router.delete('/api/deleteCollection/:collectionId', categoryController.deleteCollection)
      .delete('/api/deleteSubCat/:subCategoryId', categoryController.deleteSubCategory)


router.post('/api/addProduct', upload.fields([{ name: 'productImage', maxCount: 1 }, { name: 'detailedImages', maxCount: 10 }]),
      productController.addProduct)
module.exports = router