const router = require('express').Router()
const { newOrder ,newOrderPage} = require('./controller')

router.route('/order/new').get(newOrderPage).post(newOrder)


module.exports = router