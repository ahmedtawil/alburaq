const router = require('express').Router()
const { newUnit ,getUnitsPage,getUnitsData  } = require('./controller')

router.route('/unit/new').post(newUnit)
router.route('/unit/page/get').get(getUnitsPage)
router.route('/unit/data/get').get(getUnitsData)



module.exports = router