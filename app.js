const express = require('express');
require('dotenv').config({ path: './configs/config.env' })
const path = require('path')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler');
const {isAuthenticatedUser} = require('./middlewares/auth')
const expressLayouts = require('express-ejs-layouts');
const moment = require('moment')


const customerRoute = require('./components/customer/route')
const supplierRoute = require('./components/supplier/route')
const unit = require('./components/unit/route')

const productCategory = require('./components/productCategory/route')
const product = require('./components/product/route')
const stock = require('./components/stock/route')
const invoice = require('./components/invoice/route')
const importRoute = require('./components/import/route')
const authRoute = require('./components/auth/route')

const home = require('./components/order/route')
const util = require('./components/util/route')


const app = express();

app.use(expressLayouts)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/' , authRoute)
app.use(isAuthenticatedUser)
app.use(async(req, res, next) => {
    res.locals.user = req.user
    res.locals.moment = moment
    next()
})



app.use('/', home)
app.use('/', customerRoute)
app.use('/', supplierRoute)
app.use('/', unit)
app.use('/', productCategory)
app.use('/', product)
app.use('/', stock)
app.use('/', importRoute)

app.use('/', invoice)
app.use('/', util)











app.get((req, res, next) => {
    next(new ErrorHandler('dfdf', 404))
})

// Middleware to handle errors
app.use(errorMiddleware);


module.exports = app

