const router = require('express').Router()
const { searchForCustomerOrSupplier} = require('./controller')

router.route('/utils/search/:query').get(searchForCustomerOrSupplier) 


module.exports = router