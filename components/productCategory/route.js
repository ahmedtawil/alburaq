const router = require('express').Router()
const { newProductCategoryPage ,getProductCategoriesData,getProductCategoriesPage , newProductCategory , editProductCategory } = require('./controller')

router.route('/productCategory/new').post(newProductCategory)
router.route('/productCategories/page/get').get(getProductCategoriesPage)
router.route('/productCategories/data/get').get(getProductCategoriesData)



module.exports = router