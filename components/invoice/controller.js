const mongoose = require('mongoose')
const Supplier = require('../../models/Supplier')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

// get new Program page 

exports.newSupplierPage = catchAsyncErrors(async (req, res) => {
  res.render('supplier/new')
})


exports.getSuppliersData = catchAsyncErrors(async (req, res) => {
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

  const suppliersCount = await Supplier.estimatedDocumentCount()
  const suppliersFillterCount = await Supplier.find(queryObj).countDocuments()
  const suppliers = await Supplier.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start))
  return res.json({
    recordsTotal: suppliersCount,
    recordsFiltered: suppliersFillterCount,
    suppliers
  })


})

exports.getSuppliersPage = catchAsyncErrors(async (req, res) => {
  res.render('supplier/list')
})


// post new Program

exports.newSupplier = catchAsyncErrors(async (req, res) => {
  const data = req.body
  const newSupplier = new Supplier(data)
  await newSupplier.validate()
  newSupplier.save()
  res.end()

})
// post editPage 

exports.editSupplier = catchAsyncErrors(async (req, res) => {
  if (req.access.can(req.user.role).updateAny('program').granted) {

    let program = null
    const id = req.params.id

    if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))
    program = await Program.findById(id)
    if (!program) return next(new ErrorHandler('', 404))

    let data = JSON.parse(req.body.payload)
    _.assign(program, data)
    await program.save()
    res.send(program)
  } else {
    next(new ErrorHandler('unauthrized!', 403))
  }

})

exports.checkIFformalIDisExist = catchAsyncErrors(async (req, res) => {
  const formalID = req.params.formalID
  const found = await Supplier.findOne({ formalID })
  if (!found) return res.status(200).json({ isExisted: false })
  return res.status(200).json({ isExisted: true })

})


exports.getSupplierProfilePage = catchAsyncErrors(async (req, res) => {
  const id = req.params.supplierID
  if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))

  const supplier = await Supplier.findById(id)
  if(!supplier) return next(new ErrorHandler('', 404))

  res.render('supplier/profile/profile' , {supplier})
})

