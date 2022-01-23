const router = require('express').Router()
const { newImport ,newImportPage , editImport , getSupplierImportsData} = require('./controller')

router.route('/import/new').get(newImportPage).post(newImport)

router.route('/import/edit/:id').post(editImport)

router.route('/imports/data/supplier/get/:id').get(getSupplierImportsData)


module.exports = router