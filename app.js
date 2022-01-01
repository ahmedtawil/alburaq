const express = require('express');
require('dotenv').config({ path: './configs/config.env' })
const path = require('path')
const cookieParser = require('cookie-parser')
const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler');
const {isAuthenticatedUser} = require('./middlewares/auth')
const expressLayouts = require('express-ejs-layouts');


const customerRoute = require('./components/customer/route')
const supplierRoute = require('./components/supplier/route')
const unit = require('./components/unit/route')

const productCategory = require('./components/productCategory/route')
const product = require('./components/product/route')
const stock = require('./components/stock/route')

const home = require('./components/order/route')


const app = express();

app.use(expressLayouts)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req,res)=>{
    res.redirect('/order/new')
})


app.use('/', home)
app.use('/', customerRoute)
app.use('/', supplierRoute)
app.use('/', unit)
app.use('/', productCategory)
app.use('/', product)
app.use('/', stock)









app.get((req, res, next) => {
    next(new ErrorHandler('dfdf', 404))
})

// Middleware to handle errors
app.use(errorMiddleware);


module.exports = app

