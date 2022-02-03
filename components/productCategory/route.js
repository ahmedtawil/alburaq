const router = require('express').Router()
const { newProductCategoryPage ,getProductCategoriesData,getProductCategoriesPage 
    , newProductCategory , editProductCategory , getProductCategoryUnit , getProductCategoryByQuery , checkIfSerialNumberExist} = require('./controller')

router.route('/productCategory/new').post(newProductCategory)
router.route('/productCategory/unit/get/:id').get(getProductCategoryUnit)
router.route('/productCategory/get').get(getProductCategoryByQuery)

router.route('/productCategories/page/get').get(getProductCategoriesPage)
router.route('/productCategories/data/get').get(getProductCategoriesData)
router.route('/productCategory/checkSerialNumber/:SerialNumber').get(checkIfSerialNumberExist)



module.exports = router
