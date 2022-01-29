const router = require('express').Router()
const {getLoginPage , postLoginPage , logout} = require('./auth')

router.route('/login').get(getLoginPage).post(postLoginPage)

router.route('/logout').get(logout)

module.exports = router