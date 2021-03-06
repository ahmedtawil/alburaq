const mongoose = require('mongoose')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

const ProductCategory = require('../../models/ProductCategory')
const Product = require('../../models/Product')

const Supplier = require('../../models/Supplier')
const Unit = require('../../models/Unit')
const Stock = require('../../models/Stock')



exports.getProductsPage = catchAsyncErrors(async (req, res) => {
  const productCategory = await ProductCategory.find()

  res.render('product/list', { productCategory })
})

exports.getAllProducts = catchAsyncErrors(async (req, res) => {

  const products = await Product.find().populate({ path: 'productCategory', populate: { path: 'unit' } })

  return res.json(products)


})

exports.getProductsData = catchAsyncErrors(async (req, res) => {
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
    const productCategoriesIDS = await ProductCategory.find({ name: qu }).distinct('_id')

    const searchQuery = { $or: [{ productCategory: { $in: productCategoriesIDS } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const productsCount = await Product.estimatedDocumentCount()
  const productsFillterCount = await Product.find(queryObj).countDocuments()
  const productsFromD = await Product.find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start))
  const promises = productsFromD.map(async product => {
    await product.populate('productCategory')
    product.name = await product.getProductName()
    return product
  })
  const products = await Promise.all(promises)
  return res.json({
    recordsTotal: productsCount,
    recordsFiltered: productsFillterCount,
    products
  })


})


// post new Program

exports.newProduct = catchAsyncErrors(async (req, res) => {
  const data = JSON.parse(req.body.payload)
  const newProduct = new Product({
    serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
    name: data.name,
    productCategory: data.productCategory,
    ratioPerUnit: data.ratioPerUnit,
    price: data.price,
  })
  console.log(newProduct);
  await newProduct.validate()
  await newProduct.save()
  res.end()
})
// post editPage 

exports.editProduct = catchAsyncErrors(async (req, res) => {
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

exports.getProductByQuery = catchAsyncErrors(async (req, res) => {
  const query = req.query
  console.log(query);
  let product = await Product.findOne(query)
  let productName = await product.getProductName()
  product.name = productName
  res.send({ success: true, product })
})


exports.getProductCategoryForProduct = catchAsyncErrors(async (req, res) => {
  const productID = req.params.productID
  const product = await Product.findById(productID).populate({ path: 'productCategory', populate: { path: 'unit' } })

  res.send({ success: true, product })
})


exports.checkIfSerialNumberExist = catchAsyncErrors(async (req, res) => {
  const { productCategoryID } = req.query
  const SerialNumber = req.params.SerialNumber
  const found = await Product.findOne({ serialNumber: SerialNumber })
  if (!found) return res.status(200).json({ isExisted: false })
  if (found._id == productCategoryID) return res.status(200).json({ isExisted: false })
  return res.status(200).json({ isExisted: true })


})

exports.getAllProductsData = catchAsyncErrors(async (req, res) => {
  let { search, page } = req.query
  if (typeof search == 'undefined' || search.trim() == '') {
    search = ''
  }
  const queryObj = {
    $regex: search,
    $options: 'i'
  }

  const products = await Product.aggregate([
    {
      '$lookup': {
        'from': 'productcategories', 
        'localField': 'productCategory', 
        'foreignField': '_id', 
        'as': 'productCategory'
      }
    }, {
      '$unwind': {
        'path': '$productCategory', 
        'includeArrayIndex': '0', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$project': {
        '_id': 0, 
        'id': '$serialNumber', 
        'text': {
          '$cond': {
            'if': {
              "$gt": ["$price", 0]
            }, 
            'then': '$productCategory.name', 
            'else': {
              '$concat': [
                '$productCategory.name', ' ( ', '??????', ' ) '
              ]
            }
          }
        }
      }
    }, {
      '$match': {
        'text': queryObj
      }
    }, {
      '$limit': 15
    }
  ])
  return res.json({
    results: products,
    "pagination": {
      "more": true
    }
  })
})


