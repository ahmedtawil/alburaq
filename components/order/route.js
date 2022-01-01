const router = require('express').Router()
const { newOrder ,newOrderPage ,getOrdersPage, getTodayOrdersPage , getOrdersData} = require('./controller')

router.route('/order/new').get(newOrderPage).post(newOrder)
router.route('/orders/page/get').get(getOrdersPage)
router.route('/orders/page/today/get').get(getTodayOrdersPage)

router.route('/orders/data/get').get(getOrdersData)



module.exports = router