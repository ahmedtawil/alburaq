const router = require('express').Router()
const { getInvoicesForCustomer ,getInvoicesForSupplier, newInvoice ,getInvoicesData , getTodayInvoicesPage , getInvoiceOrderByQuery , getInvoiceImportByQuery} = require('./controller')
//router.route('/invoices/page/get').get(getTodayInvoicesPage)
router.route('/invoices/data/get').get(getInvoicesData)
router.route('/invoices/page/today/get').get(getTodayInvoicesPage)

router.route('/invoices/data/customer/get/:customerID').get(getInvoicesForCustomer)
router.route('/invoices/data/supplier/get/:SupplierID').get(getInvoicesForSupplier)

router.route('/invoice/order/get').get(getInvoiceOrderByQuery)
router.route('/invoice/import/get').get(getInvoiceImportByQuery)

router.route('/invoice/new').post(newInvoice)


module.exports = router