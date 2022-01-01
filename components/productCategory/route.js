const router = require('express').Router()
const { newProductCategoryPage ,getProductCategoriesData,getProductCategoriesPage , newProductCategory , editProductCategory , getProductCategoryUnit } = require('./controller')

router.route('/productCategory/new').post(newProductCategory)
router.route('/productCategory/unit/get/:id').get(getProductCategoryUnit)

router.route('/productCategories/page/get').get(getProductCategoriesPage)
router.route('/productCategories/data/get').get(getProductCategoriesData)



module.exports = router
