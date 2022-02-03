const router = require('express').Router()
const { newSupplier ,newSupplierPage,getSuppliers , editSupplier , checkIFformalIDisExist , getSuppliersPage , getSuppliersData , getSupplierProfilePage} = require('./controller')

router.route('/supplier/new').get(newSupplierPage).post(newSupplier)
router.route('/supplier/edit/:id').post(editSupplier)

router.route('/suppliers/page/get').get(getSuppliersPage)
router.route('/suppliers/data/get').get(getSuppliersData)
router.route('/supplier/profile/get/:supplierID').get(getSupplierProfilePage)

//router.route('/supplier/get').get(getSuppliers)
router.route('/supplier/checkID/:formalID').get(checkIFformalIDisExist)


module.exports = router