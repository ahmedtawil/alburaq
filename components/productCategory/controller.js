const mongoose = require('mongoose')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const _ = require('lodash')
const ProductCategory = require('../../models/ProductCategory')
const Supplier = require('../../models/Supplier')
const Unit = require('../../models/Unit')
const Order = require('../../models/Order')

const Product = require('../../models/Product')
const Stock = require('../../models/Stock')



exports.getProductCategoriesPage = catchAsyncErrors(async (req, res) => {
  const units = await Unit.find()
  const suppliers = await Supplier.find()

  res.render('productCategory/list', { units, suppliers })
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
    const searchQuery = { $or: [{ name: qu }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const productCategoriesCount = await ProductCategory.estimatedDocumentCount()
  const productCategoriesFillterCount = await ProductCategory.find(queryObj).countDocuments()
  const productCategories = await ProductCategory.find(queryObj).sort({createdAt:-1}).limit(parseInt(query.length)).skip(parseInt(query.start)).populate({ path: 'unit' }).populate({ path: 'supplier', select: { name: 1 } })
  return res.json({
    recordsTotal: productCategoriesCount,
    recordsFiltered: productCategoriesFillterCount,
    productCategories
  })


})



// post new Program

exports.newProductCategory = catchAsyncErrors(async (req, res) => {
  const data = JSON.parse(req.body.payload)
  const newProductCategory = new ProductCategory({
    serialNumber: (data.configs.internalProductCategorySerialNumber) ? null : data.productCategorySerialNumber,
    name: data.name,
    unit: data.unit,
    costPrice: data.productCategoryCostPrice,
    sellingPrice: data.productCategorySellingPrice,
    supplier: data.supplier
  })
  await newProductCategory.save()

  const productCategory = await ProductCategory.findById(newProductCategory._id).populate({ path: 'unit' })
  let productData = {
    serialNumber: productCategory.serialNumber,
    productCategory: productCategory._id,
    ratioPerUnit: productCategory.unit.weight,
    price: productCategory.sellingPrice

  }
  const product1 = new Product(productData)
  product1.save()

  if (data.configs.addProduct && data.configs.isWeightUnit != true) {
    productData = {
      serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
      productCategory: productCategory._id,
      ratioPerUnit: 1,
      price: data.productSellingPrice

    }

    const product2 = new Product(productData)
    await product2.save()
  }
  if (data.configs.isWeightUnit) {
    console.log('****************************************');

    productData = {
      serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
      productCategory: productCategory._id,
      takePrice:false
    }
    const product2 = new Product(productData)
    await product2.save()
  }
  const stock = new Stock({ productCategory: productCategory._id, qty: data.qty })
  stock.save()

  res.end()
})
// post editPage 

exports.getProductCategoryUnit = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id
  if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))

  let productCategory = await ProductCategory.findById(id).populate({ path: 'unit' }).lean()
  if (!productCategory) return next(new ErrorHandler('', 404))

  let unit = productCategory.unit


  res.json(unit)
})
exports.getProductCategoryByQuery = catchAsyncErrors(async (req, res, next) => {

  const query = req.query
  const productCategory = await ProductCategory.findOne(query).populate('unit')
  res.send({ success: true, productCategory })

})

exports.getEditProductCategoryData = catchAsyncErrors(async (req, res, next) => {
  const productCategoryID = req.params.id
  if (!mongoose.isValidObjectId(productCategoryID)) return next(new ErrorHandler('', 404))
  const productCategory = await ProductCategory.findById(productCategoryID).populate('unit').lean()
  const productCategoryInStock = await Stock.findOne({ productCategory: productCategory._id }).lean()
  productCategory.qty = productCategoryInStock.qty
  const product = await Product.findOne({ productCategory: productCategory._id, ratioPerUnit: 1 }).lean()
  res.json({
    productCategory, product, configs: {
      addProduct: (product && productCategory.unit.isWeightUnit != true) ? true : false,
    }
  })

})

exports.editProductCategory = catchAsyncErrors(async (req, res, next) => {
  const productCategoryID = req.params.id
  const data = JSON.parse(req.body.payload)
  if (!mongoose.isValidObjectId(productCategoryID)) return next(new ErrorHandler('', 404))

  const productCategoryFromDB = await ProductCategory.findById(productCategoryID).populate('unit')
  const productCategoryFromDBUnit = productCategoryFromDB.unit

  if (!productCategoryFromDB) return next(new ErrorHandler('', 404))

  const newProductCategoryObj = {
    serialNumber: (data.configs.internalProductCategorySerialNumber) ? null : data.productCategorySerialNumber,
    name: data.name,
    unit: data.unit,
    costPrice: data.productCategoryCostPrice,
    sellingPrice: data.productCategorySellingPrice,
    supplier: data.supplier
  }
  _.assign(productCategoryFromDB, newProductCategoryObj)
  const newProductCategoryFromDB = await productCategoryFromDB.save()

  const newUnit = await Unit.findById(newProductCategoryObj.unit)


  await Product.updateOne({ productCategory: productCategoryID , ratioPerUnit: productCategoryFromDBUnit.weight} , {price:newProductCategoryObj.sellingPrice , serialNumber:newProductCategoryFromDB.serialNumber}) 


  if(data.configs.addProduct && data.configs.isWeightUnit != true){
    const newProductObj = {
      serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
      price: data.productSellingPrice
    }
    let product = await Product.findOne({ productCategory: productCategoryID , ratioPerUnit: 1})
    if(!product){
      newProductObj.productCategory = productCategoryID
      newProductObj.ratioPerUnit = ratioPerUnit
      product = new Product(newProductObj)
      await product.save() 
    }else{
      _.assign(product, newProductObj)
      await product.save()  
    }
  
  }else{
    await Product.deleteOne({productCategory: productCategoryID , ratioPerUnit: 1})
  }
  if(productCategoryFromDBUnit.isWeightUnit != true && data.configs.isWeightUnit){
    await Product.deleteMany({productCategory: productCategoryID })


    let newProductData = {
      serialNumber: newProductCategoryFromDB.serialNumber,
      productCategory: newProductCategoryFromDB._id,
      ratioPerUnit: 1000,
      price: newProductCategoryFromDB.sellingPrice
    }
    const product1 = new Product(newProductData)
    product1.save()

    newProductData = {
      serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
      productCategory: newProductCategoryFromDB._id,
      takePrice:false
    }
    const product2 = new Product(newProductData)
    await product2.save()
  }

  await Stock.updateOne({productCategory: productCategoryID} , {qty:data.qty})

  res.end()

})

exports.deleteProductCategory = catchAsyncErrors(async (req, res , next) => {
  const productCategoryID  = req.params.id
  if (!mongoose.isValidObjectId(productCategoryID)) return next(new ErrorHandler('', 404))

  const productCategory = await ProductCategory.findById(productCategoryID)
  if (!productCategory) return next(new ErrorHandler('', 404))

  const productCategoryProductsIDS = await Product.find({productCategory:productCategory._id}).distinct('_id')

  const isProductCategoryUsed = await Order.exists({'products._id':{$in:productCategoryProductsIDS}})
  if(isProductCategoryUsed) return next(new ErrorHandler('لا يمكن حذف الصنف لانه مستخدم في طلبات', 400))


  await ProductCategory.deleteOne({_id:productCategory._id})
  await Product.deleteMany({productCategory:productCategory._id})
  await Stock.deleteOne({productCategory:productCategory._id})



  res.json({
    success:true
  })


})



exports.checkIfSerialNumberExist = catchAsyncErrors(async (req, res) => {
  const { productCategoryID } = req.query
  const SerialNumber = req.params.SerialNumber

  const found = await ProductCategory.findOne({ serialNumber: SerialNumber })
  if (!found) return res.status(200).json({ isExisted: false })
  if (found._id == productCategoryID) return res.status(200).json({ isExisted: false })
  return res.status(200).json({ isExisted: true })


})
