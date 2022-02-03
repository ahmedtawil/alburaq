const router = require('express').Router()
const { getProductsData,getProductsPage , newProduct , getProductByQuery ,
     getAllProducts , getProductCategoryForProduct , checkIfSerialNumberExist} = require('./controller')

router.route('/product/new').post(newProduct)
router.route('/products/page/get').get(getProductsPage)
router.route('/products/data/get').get(getProductsData)
router.route('/products/get').get(getAllProducts)
router.route('/product/get').get(getProductByQuery)
router.route('/product/productCategory/:productID/get').get(getProductCategoryForProduct)
router.route('/product/checkSerialNumber/:SerialNumber').get(checkIfSerialNumberExist)



module.exports = router