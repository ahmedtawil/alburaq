const router = require('express').Router()
const { newOrder,editOrder ,newOrderPage ,getOrdersPage, getTodayOrdersPage , getOrdersData , getOrdersForCustomer} = require('./controller')

router.route('/order/new').get(newOrderPage).post(newOrder)
router.route('/order/edit/:id').post(editOrder)

router.route('/orders/page/get').get(getOrdersPage)
router.route('/orders/page/today/get').get(getTodayOrdersPage)

router.route('/orders/data/get').get(getOrdersData)
router.route('/orders/data/customer/get/:customerID').get(getOrdersForCustomer)



module.exports = router