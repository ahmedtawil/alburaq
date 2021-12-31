const mongoose = require('mongoose')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

const ProductCategory = require('../../models/ProductCategory')
const Supplier = require('../../models/Supplier')
const Unit = require('../../models/Unit')
const Product = require('../../models/Product')
const Stock = require('../../models/Stock')

const { killogramUnitID } = require('../../configs/constants')


exports.getProductCategoriesPage = catchAsyncErrors(async (req, res) => {
  const units = await Unit.find()
  const suppliers = await Supplier.find()

  res.render('productCategory/list', { units, suppliers, killogramUnitID })
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
  const productCategories = await ProductCategory.find(queryObj).limit(parseInt(query.length)).skip(parseInt(query.start)).populate({ path: 'unit' }).populate({ path: 'supplier', select: { name: 1 } })

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
    costPrice:data.productCategoryCostPrice,
    sellingPrice: data.productCategorySellingPrice,
    supplier: data.supplier
  })
  await newProductCategory.validate()
  await newProductCategory.save()

  const productCategory = await ProductCategory.findById(newProductCategory._id).populate({ path: 'unit' })
  let productData = {
    name: `${productCategory.name} ${productCategory.unit.title}`,
    serialNumber: productCategory.serialNumber,
    productCategory: productCategory._id,
    ratioPerUnit: productCategory.unit.weight,
    price: productCategory.sellingPrice

  }
  const product1 = new Product(productData)
  product1.save()

  if(data.configs.addProduct){
    productData = {
      name:`${productCategory.name} ${(data.configs.isWeightUnit)? `وزن` : `قطعة`}`,
      serialNumber: (data.configs.internalProductSerialNumber) ? null : data.productSerialNumber,
      productCategory: productCategory._id,
    }
    if (!data.configs.isWeightUnit) {
      productData = {
        ...productData,
        ratioPerUnit: 1,
        price: data.productSellingPrice
      }
    }
  
    const product2 = new Product(productData)
    product2.save()
  }
  const stock = new Stock({ productCategory: productCategory._id, qty: data.qty })
  stock.save()

  res.end()
})
// post editPage 

exports.getProductCategoryUnit = catchAsyncErrors(async (req, res , next) => {
    const id = req.params.id
    if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))

    let productCategory = await ProductCategory.findById(id).populate({path:'unit'}).lean()
    if (!productCategory) return next(new ErrorHandler('', 404))

    let unit = productCategory.unit

    if(unit._id == killogramUnitID){
      unit.isWeightUnit = true
    }else{
      unit.isWeightUnit = false
    }

    res.json(unit)
})

exports.editProductCategory = catchAsyncErrors(async (req, res , next) => {
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




