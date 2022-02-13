const mongoose = require('mongoose')
const Import = require('../../models/Import')

const Supplier = require('../../models/Supplier')

const Product = require('../../models/Product')
const ProductCategory = require('../../models/ProductCategory')

const Stock = require('../../models/Stock')


const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const Invoice = require('../../models/Invoice')

exports.newImportPage = catchAsyncErrors(async (req, res, next) => {
  const suppliers = await Supplier.find()
  const productCategories = await ProductCategory.find().populate('unit')

  res.render('import/cpanel', { suppliers, productCategories })
})

exports.getImportsPage = catchAsyncErrors(async (req, res, next) => {
  res.render('import/list')
})
exports.getTodayImportsPage = catchAsyncErrors(async (req, res, next) => {
  res.render('import/todayList')
})

exports.getImportsData = catchAsyncErrors(async (req, res) => {
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
    const suppliersIDs = await Supplier.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { supplier: { $in: suppliersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const importsCount = await Import.estimatedDocumentCount()
  const importsFillterCount = await Import.find(queryObj).countDocuments()
  const imports = await Import.find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start)).populate({ path: 'supplier' })

  return res.json({
    recordsTotal: importsCount,
    recordsFiltered: importsFillterCount,
    imports
  })


})

exports.getImportsForSupplier = catchAsyncErrors(async (req, res, next) => {
  const query = req.query
  const supplierID = req.params.supplierID

  if (!mongoose.isValidObjectId(supplierID)) return next(new ErrorHandler('', 404))
  const supplier = await Supplier.findById(supplierID)
  if (!supplier) return next(new ErrorHandler('', 404))


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
    const suppliersIDs = await Supplier.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { supplier: { $in: suppliersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const importsCount = await Import.countDocuments({ supplier: supplierID })
  const imports = await Import.find({ supplier: supplierID }).find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start))
  return res.json({
    recordsTotal: importsCount,
    recordsFiltered: imports.length,
    imports
  })


})




exports.newImport = catchAsyncErrors(async (req, res, next) => {
  const data = JSON.parse(req.body.payload)

  const newImport = new Import(data)

  const { productCategories } = newImport
  /*
   return res.end()
*/
  const promises = productCategories.map(async (productCategory, productIndex) => {
    const productCategoryID = productCategory._id

    const productCategoryInStock = await Stock.findOne({ productCategory: productCategoryID })

    const productCategoryInDB = await ProductCategory.findOne({ _id: productCategoryID })
    if (!productCategoryInDB) return next(new ErrorHandler('', 404))


    await ProductCategory.updateOne({ _id: productCategoryID }, { costPrice: productCategory.costPrice, sellingPrice: productCategory.sellingPrice })
    await Product.updateMany({ serialNumber: productCategoryInDB.serialNumber }, { price: productCategory.sellingPrice })
    productCategoryInStock.qty += productCategory.qty
    return productCategoryInStock.save()
  })

  Promise.all(promises).then(async result => {
    newImport.save()
    const supplier = await Supplier.findById(data.supplier)
    if (!supplier) return next(new ErrorHandler('', 404))

    const invoiceData = {
      InvoiceType: 'import',
      ObjType: 'Import',
      data: newImport._id,
      forType: 'Supplier',
      for: newImport.supplier,
      amount: newImport.paidAmount,
      oldBalance: supplier.credit,
      createdBy:req.user._id,

    }
    if (newImport.moneyBack < 0) {
      supplier.credit += (newImport.totalPrice - newImport.paidAmount)
      supplier.save()
    }
    invoiceData.newBalance = supplier.credit
    const invoice = new Invoice(invoiceData)
    await invoice.save()
    res.json(invoice)


  })
})



exports.editImport = catchAsyncErrors(async (req, res , next) => {
  const data = JSON.parse(req.body.payload)

  const existImport = await Import.findById(data._id)
  if (!existImport) return next(new ErrorHandler('import record not found', 404))

  let supplier = await Supplier.findById(data.supplier._id)
  if (!supplier) return next(new ErrorHandler('supplier record not found', 404))


  const { productCategories: oldProductCategories } = existImport
  const { productCategories: newProductCategories } = data

  const minsAllFromStockPromises = oldProductCategories.map(async (productCategory, productIndex) => {
    const productCategoryID = productCategory._id

    const productCategoryInStock = await Stock.findOne({ productCategory: productCategoryID })

    productCategoryInStock.qty -= productCategory.qty
    return productCategoryInStock.save()
  })


  Promise.all(minsAllFromStockPromises).then(async result => {

    const returnAllToStockPromises = newProductCategories.map(async (productCategory, productIndex) => {
      const productCategoryID = productCategory._id
  
      const productCategoryInStock = await Stock.findOne({ productCategory:productCategoryID })
  
      const productCategoryInDB = await ProductCategory.findOne({ _id:productCategoryID })
      if (!productCategoryInDB) return next(new ErrorHandler('', 404))
  
  
      await ProductCategory.updateOne({_id:productCategoryID} , {costPrice:productCategory.costPrice , sellingPrice:productCategory.sellingPrice})
      await Product.updateMany({serialNumber:productCategoryInDB.serialNumber} , {price:productCategory.sellingPrice})
      productCategoryInStock.qty += productCategory.qty
      return productCategoryInStock.save()
    })

    Promise.all(returnAllToStockPromises).then(async result => { 
      await Import.updateOne({ _id: data._id }, { $set: data })

      const invoiceData = {
        ObjType: 'Import',
        data: data._id,
        forType: 'Supplier',
        for: supplier._id,
        createdBy:req.user._id,

      }

      let oldTotalImport = existImport.totalPrice - existImport.paidAmount
      let newTotalImport = data.totalPrice - data.paidAmount


      if (newTotalImport > oldTotalImport) {
        invoiceData.InvoiceType = 'extra'
        const myDebit = newTotalImport - oldTotalImport
        invoiceData.amount = myDebit
        invoiceData.oldBalance = supplier.credit
        invoiceData.newBalance = invoiceData.oldBalance + invoiceData.amount
        supplier.credit = invoiceData.newBalance

      } else if (newTotalImport < oldTotalImport) {
        invoiceData.InvoiceType = 'return'
        const myDebit = oldTotalImport - newTotalImport
        invoiceData.amount = myDebit

        invoiceData.oldBalance = supplier.credit
        invoiceData.newBalance = invoiceData.oldBalance - invoiceData.amount
        supplier.credit = invoiceData.newBalance

      } else {
        invoiceData.InvoiceType = 'exchange'
        invoiceData.amount = 0
        invoiceData.oldBalance = supplier.credit
        invoiceData.newBalance = supplier.credit

      }
      await supplier.save({ validateBeforeSave: false })
      const invoice = new Invoice(invoiceData)
      await invoice.save()

      res.json(invoice)



    })


    

  })







})


exports.getSupplierImportsData = catchAsyncErrors(async (req, res , next) => {
  const query = req.query
  const supplierID = req.params.id

  if (!mongoose.isValidObjectId(supplierID)) return next(new ErrorHandler('', 404))
  const supplier = await Supplier.findById(supplierID)
  if (!supplier) return next(new ErrorHandler('', 404))


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
    const suppliersIDs = await Supplier.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { supplier: { $in: suppliersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const importsCount = await Import.countDocuments({ supplier: supplierID })
  const imports = await Import.find({ supplier: supplierID }).find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start))
  return res.json({
    recordsTotal: importsCount,
    recordsFiltered: imports.length,
    imports
  })



})


exports.getImportsPage = catchAsyncErrors(async (req, res, next) => {
  res.render('import/list')

})

exports.getImportsData = catchAsyncErrors(async (req, res, next) => {
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
    const suppliersIDs = await Supplier.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { supplier: { $in: suppliersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const importsCount = await Import.countDocuments()
  const imports = await Import.find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start)).populate('supplier')
  return res.json({
    recordsTotal: importsCount,
    recordsFiltered: imports.length,
    imports
  })

})
 