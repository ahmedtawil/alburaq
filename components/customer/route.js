const router = require('express').Router()
const { newCustomer ,newCustomerPage,getCustomers , editCustomer , checkIFformalIDisExist , getCustomersPage , getCustomersData , getCustomerProfilePage} = require('./controller')

router.route('/customer/new').get(newCustomerPage).post(newCustomer)
router.route('/customers/page/get').get(getCustomersPage)
router.route('/customers/data/get').get(getCustomersData)
router.route('/customer/profile/get/:customerID').get(getCustomerProfilePage)

//router.route('/customer/get').get(getCustomers)
router.route('/customer/checkID/:formalID').get(checkIFformalIDisExist)


module.exports = router