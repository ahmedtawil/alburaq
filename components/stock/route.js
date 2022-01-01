const router = require('express').Router()
const {getStockData,getStockPage} = require('./controller')


router.route('/stock/page/get').get(getStockPage)
router.route('/stock/data/get').get(getStockData)



module.exports = router