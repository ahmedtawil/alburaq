const router = require('express').Router()
const { newProductCategoryPage ,getProductCategoriesData,getProductCategoriesPage , newProductCategory , editProductCategory , getProductCategoryUnit , getProductCategoryByQuery } = require('./controller')

router.route('/productCategory/new').post(newProductCategory)
router.route('/productCategory/unit/get/:id').get(getProductCategoryUnit)
router.route('/productCategory/get').get(getProductCategoryByQuery)

router.route('/productCategories/page/get').get(getProductCategoriesPage)
router.route('/productCategories/data/get').get(getProductCategoriesData)



module.exports = router
