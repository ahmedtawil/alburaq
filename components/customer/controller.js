const mongoose = require('mongoose')
const Customer = require('../../models/Customer')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const _ = require('lodash')
// get new Program page 

exports.newCustomerPage = catchAsyncErrors(async (req, res) => {
  res.render('customer/new')
})


exports.getCustomersData = catchAsyncErrors(async (req, res) => {
  const query = req.query

  const queryValue = (req.query.search.value == '') ? {} : JSON.parse(query.search.value)
  let queryObj = {}

  if (queryValue.filter) {
    queryObj.$and = [queryValue.filter]
  }

  if (queryValue.search) {
    let val = queryValue.search
    const qu = {
      $regex: val,
      $options: 'i'
    }
    const searchQuery = { $or: [{ formalID: qu }, { name: qu }, { phoneNumber: qu }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const customersCount = await Customer.estimatedDocumentCount()
  const customersFillterCount = await Customer.find(queryObj).countDocuments()
  const customers = await Customer.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start))

  return res.json({
    recordsTotal: customersCount,
    recordsFiltered: customersFillterCount,
    customers
  })


})

exports.getCustomersPage = catchAsyncErrors(async (req, res) => {
  res.render('customer/list')
})


// post new Program

exports.newCustomer = catchAsyncErrors(async (req, res) => {
  const data = req.body
  const newCustomer = new Customer(data)
  await newCustomer.validate()
  newCustomer.save()
  res.end()

})
// post editPage 

exports.editCustomer = catchAsyncErrors(async (req, res) => {
    let customer = null
    const id = req.params.id

    if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))
    customer = await Customer.findById(id)
    if (!customer) return next(new ErrorHandler('', 404))

    let data = JSON.parse(req.body.payload)
    _.assign(customer, data)
    await customer.save()
    res.send(customer)

})

exports.checkIFformalIDisExist = catchAsyncErrors(async (req, res) => { 
  const existCustomerID = req.query.customerID
  const formalID = req.params.formalID
  const found = await Customer.findOne({ formalID })
  if (!found) return res.status(200).json({ isExisted: false })
  if(found._id == existCustomerID) return res.status(200).json({ isExisted: false })
  return res.status(200).json({ isExisted: true })

})


exports.getCustomerProfilePage = catchAsyncErrors(async (req, res) => {
  const id = req.params.customerID
  if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))

  const customer = await Customer.findById(id)
  if(!customer) return next(new ErrorHandler('', 404))

  res.render('customer/profile/profile' , {customer})
})

