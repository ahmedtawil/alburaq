const router = require('express').Router()
const { newProductCategoryPage ,getProductCategoriesData,getProductCategoriesPage 
    , newProductCategory ,getEditProductCategoryData, editProductCategory, deleteProductCategory , getProductCategoryUnit , getProductCategoryByQuery , checkIfSerialNumberExist} = require('./controller')

router.route('/productCategory/new').post(newProductCategory)
router.route('/productCategory/unit/get/:id').get(getProductCategoryUnit)
router.route('/productCategory/get').get(getProductCategoryByQuery)

router.route('/productCategories/page/get').get(getProductCategoriesPage)
router.route('/productCategories/data/get').get(getProductCategoriesData)
router.route('/productCategory/edit/data/get/:id').get(getEditProductCategoryData)
router.route('/productCategory/edit/:id').post(editProductCategory)
router.route('/productCategory/delete/:id').get(deleteProductCategory)

router.route('/productCategory/checkSerialNumber/:SerialNumber').get(checkIfSerialNumberExist)



module.exports = router
