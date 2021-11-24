//const Employee = require('../models/Employee')

const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies || {token: null}
    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 401))
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    const employee = await Employee.findById(decoded.id);
    if(!employee)  {
        
        return next(new ErrorHandler('user not found!.', 401))

    }
    req.user = employee   
    next()
})
