const router = require('express').Router()
const User = require('../../models/User')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const sendToken = require('../../utils/jwtToken');




exports.getLoginPage = catchAsyncErrors(async (req, res, next) => {
  
    res.render('auth/login' , {layout:false})
  
  })

// Login User  =>  /a[i/v1/login
exports.postLoginPage = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('الرجاء إدخال رقم الهوية وكلمة المرور.', 400))
    }

    // Finding user in database
    const user = await User.findOne({ email , password })

    if (!user) {
        return next(new ErrorHandler('خطأ في رقم الهوية أو كلمة المرور.', 400));
    }

    sendToken(user, 200, res)
})

// Logout user  
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.redirect('/login')
})
