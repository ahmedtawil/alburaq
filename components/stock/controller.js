const mongoose = require('mongoose')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

const Supplier = require('../../models/Supplier')
const Unit = require('../../models/Unit')
const Stock = require('../../models/Stock')

const ProductCategory = require('../../models/ProductCategory')


exports.getStockPage = catchAsyncErrors(async (req, res) => {
  res.render('stock/list')
})

exports.getStockData = catchAsyncErrors(async (req, res) => {
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
    const productCategories = await ProductCategory.find({name:qu}).distinct('_id')
    const searchQuery = { $or: [ { productCategory: productCategories }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const stockCount = await Stock.estimatedDocumentCount()
  const stockFillterCount = await Stock.find(queryObj).countDocuments()
  const stock = await Stock.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start))
  .populate({ path: 'productCategory' , populate:[{path:'unit'} , {path:'supplier' , select:{name:1}}]  })

  return res.json({
    recordsTotal: stockCount,
    recordsFiltered: stockFillterCount,
    stock
  })
  


})



