const adminController = require('../../controllers/admin/adminController')

const express = require('express')
const router = express.Router()

router.get('/addProduct', adminController.getAddProduct )

router.post('/api/createCategory/:categoryName' , adminController.createCategory)
      .post('/api/changeCategoryName/:categoryName' , adminController.changeCategoryName)
      .post('/api/addSubCategory/:subCategoryName' , adminController.createSubCategory)
      .post('/api/createCollection/:collectionName/:chosenSubCategoryId' , adminController.createCollection)
      .post('/api/changeSubCategory/:chosenCollectionParent' , adminController.changeSubCategory)
      .post('/api/deleteUnsavedCategory' , adminController.deleteUnsavedCategory)
      .post('/checking' , adminController.checking)


module.exports = router