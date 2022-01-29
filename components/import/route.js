const router = require('express').Router()
const { newImport ,newImportPage , editImport , getSupplierImportsData , getImportsPage , getImportsData} = require('./controller')

router.route('/import/new').get(newImportPage).post(newImport)

router.route('/import/edit/:id').post(editImport)

router.route('/imports/data/supplier/get/:id').get(getSupplierImportsData)
router.route('/imports/page/get').get(getImportsPage)
router.route('/imports/data/get').get(getImportsData)


module.exports = router