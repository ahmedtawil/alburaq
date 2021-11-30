const mongoose = require('mongoose')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

const ProductCategory = require('../../models/ProductCategory')
const Supplier = require('../../models/Supplier')
const Unit = require('../../models/Unit')


exports.getProductCategoriesPage = catchAsyncErrors(async (req, res) => {
  const units = await Unit.find()
  const suppliers = await Supplier.find()

  res.render('productCategory/list' , {units , suppliers})
})

exports.getProductCategoriesData = catchAsyncErrors(async (req, res) => {
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

  const productCategoriesCount = await ProductCategory.estimatedDocumentCount()
  const productCategoriesFillterCount = await ProductCategory.find(queryObj).countDocuments()
  const productCategories = await ProductCategory.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start))

  return res.json({
    recordsTotal: productCategoriesCount,
    recordsFiltered: productCategoriesFillterCount,
    productCategories
  })


})



// post new Program

exports.newProductCategory = catchAsyncErrors(async (req, res) => {
  const data = req.body
  const newProductCategory = new ProductCategory(data)
  await newProductCategory.validate()
  newProductCategory.save()
  res.end()

})
// post editPage 

exports.editProductCategory = catchAsyncErrors(async (req, res) => {
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



