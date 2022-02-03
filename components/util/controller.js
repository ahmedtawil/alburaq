const mongoose = require('mongoose')
const Supplier = require('../../models/Supplier')
const Customer = require('../../models/Customer')

const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const _ = require('lodash')
// get new Program page 

exports.searchForCustomerOrSupplier = catchAsyncErrors(async (req, res) => {
  const query = req.params.query

  const qu = {
    $regex: query,
    $options: 'i'
  }
  const customers = await Customer.find({ $or: [{ formalID: qu }, { name: qu }, { phoneNumber: qu }] }).limit(8).lean()
  const suppliers = await Supplier.find({ $or: [{ formalID: qu }, { name: qu }, { phoneNumber: qu }] }).limit(8).lean()
  const resArray = []
  customers.map(customer=>{
    customer.type = 'customer'
    resArray.push(customer)
  })
  suppliers.map(supplier=>{
    supplier.type = 'supplier'
    resArray.push(supplier)
  })

  res.json(resArray)

})


