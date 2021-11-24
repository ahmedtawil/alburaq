const express = require('express');
require('dotenv').config({ path: './configs/config.env' })
const path = require('path')
const cookieParser = require('cookie-parser')



const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler');
const {isAuthenticatedUser} = require('./middlewares/auth')

const expressLayouts = require('express-ejs-layouts');


const app = express();

app.use(expressLayouts)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))






app.get((req, res, next) => {
    next(new ErrorHandler('dfdf', 404))
})

// Middleware to handle errors
app.use(errorMiddleware);


module.exports = app

