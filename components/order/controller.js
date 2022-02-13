const mongoose = require('mongoose')
const Order = require('../../models/Order')
const Customer = require('../../models/Customer')
const Product = require('../../models/Product')
const Stock = require('../../models/Stock')


const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const Invoice = require('../../models/Invoice')

exports.newOrderPage = catchAsyncErrors(async (req, res, next) => {
  const customers = await Customer.find()
  const productsFromD = await Product.find()

  const promises = productsFromD.map(async product => {
    await product.populate({
      path: 'productCategory',
      populate: {
        path: 'unit'
      }
    })
    product.name = await product.getProductName()
    return product
  })
  const products = await Promise.all(promises)


  res.render('order/cpanel', { customers, products})
})

exports.getOrdersPage = catchAsyncErrors(async (req, res, next) => {
  res.render('order/list')
})
exports.getTodayOrdersPage = catchAsyncErrors(async (req, res, next) => {
  res.render('order/todayList')
})

exports.getOrdersData = catchAsyncErrors(async (req, res) => {
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
    const customersIDs = await Customer.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { customer: { $in: customersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const ordersCount = await Order.estimatedDocumentCount()
  const ordersFillterCount = await Order.find(queryObj).countDocuments()
  const orders = await Order.find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start)).populate({ path: 'customer' })

  return res.json({
    recordsTotal: ordersCount,
    recordsFiltered: ordersFillterCount,
    orders
  })


})

exports.getOrdersForCustomer = catchAsyncErrors(async (req, res, next) => {
  const query = req.query
  const customerID = req.params.customerID

  if (!mongoose.isValidObjectId(customerID)) return next(new ErrorHandler('', 404))
  const customer = await Customer.findById(customerID)
  if (!customer) return next(new ErrorHandler('', 404))


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
    const customersIDs = await Customer.find({ name: qu }, { _id: 1 })
    const searchQuery = { $or: [{ serialNumber: qu }, { customer: { $in: customersIDs } }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const ordersCount = await Order.countDocuments({ customer: customerID })
  const orders = await Order.find({ customer: customerID }).find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start))
  return res.json({
    recordsTotal: ordersCount,
    recordsFiltered: orders.length,
    orders
  })


})




exports.newOrder = catchAsyncErrors(async (req, res) => {
  const data = JSON.parse(req.body.payload)
  data.createdBy = req.user._id

  let customerID = data.customer
  if (customerID == 'public') {
    const publicCustomer = await Customer.findOne({ type: customerID })
    data.customer = publicCustomer._id
  }

  const newOrder = new Order(data)

  const order = await newOrder.populate({ path: 'productsData', populate: { path: "productCategory", populate: { path: 'unit' } } })
  const { products } = order
  const populatedProducts = order.productsData
  /*
   return res.end()
*/
  const promises = products.map(async (product, productIndex) => {
    const orginProduct = populatedProducts[productIndex]
    const unitWeight = orginProduct.productCategory.unit.weight
    const productCategory = orginProduct.productCategory._id
    let qtyToMin = 0
    if (product.manualPrice) {
      const price = product.price
      const sellingPrice = orginProduct.productCategory.sellingPrice
      qtyToMin = ((price * unitWeight) / sellingPrice) / unitWeight
    } else {
      const qty = product.qty
      const ratioPerUnit = orginProduct.ratioPerUnit
      qtyToMin = (qty * ratioPerUnit) / unitWeight
    }
    const productCategoryInStock = await Stock.findOne({ productCategory })
    productCategoryInStock.qty -= qtyToMin
    return productCategoryInStock.save()
  })

  Promise.all(promises).then(async result => {
    newOrder.save()
    const invoiceData = {
      InvoiceType: 'order',
      ObjType: 'Order',
      data: newOrder._id,
      forType: 'Customer',
      for: data.customer,
      amount: newOrder.totalPrice,
      createdBy: req.user._id

    }
    if (customerID !== 'public') {
      customer = await Customer.findById(newOrder.customer)
      const debit = newOrder.totalPrice - newOrder.paidAmount
      invoiceData.for = customer._id
      invoiceData.amount = newOrder.paidAmount
      invoiceData.oldBalance = customer.debt
      if (debit < 0) {
        invoiceData.newBalance = invoiceData.oldBalance
      } else {
        invoiceData.newBalance = invoiceData.oldBalance + debit
        customer.debt = invoiceData.newBalance
        await customer.save({ validateBeforeSave: false })
      }
    }
    const invoice = new Invoice(invoiceData)
    await invoice.save()

    res.json(invoice)

  })
})



exports.editOrder = catchAsyncErrors(async (req, res) => {
  const data = JSON.parse(req.body.payload)
  data.updatedBy = req.user._id

  let customerObj = data.customer

  //
  const existOrder = await Order.findById(data._id).populate({ path: 'productsData', populate: { path: "productCategory", populate: { path: 'unit' } } })
  const newOrder = new Order(data)
  newOrder.customer = customerObj._id
  const newOrderPopulated = await newOrder.populate({ path: 'productsData', populate: { path: "productCategory", populate: { path: 'unit' } } })

  const { products } = existOrder
  const populatedProducts = existOrder.productsData

  const returnAllToStockPromises = products.map(async (product, productIndex) => {
    const orginProduct = populatedProducts[productIndex]
    const unitWeight = orginProduct.productCategory.unit.weight
    const productCategory = orginProduct.productCategory._id
    let qtyToPlus = 0
    if (product.manualPrice) {
      const price = product.price
      const sellingPrice = orginProduct.productCategory.sellingPrice
      qtyToPlus = ((price * unitWeight) / sellingPrice) / unitWeight
    } else {
      const qty = product.qty
      const ratioPerUnit = orginProduct.ratioPerUnit
      qtyToPlus = (qty * ratioPerUnit) / unitWeight
    }
    const productCategoryInStock = await Stock.findOne({ productCategory })
    productCategoryInStock.qty += qtyToPlus
    return productCategoryInStock.save()
  })

  Promise.all(returnAllToStockPromises).then(async result => {
    const { products } = newOrderPopulated
    const populatedProducts = newOrderPopulated.productsData

    const minsAllFromStock = products.map(async (product, productIndex) => {
      const orginProduct = populatedProducts[productIndex]
      const unitWeight = orginProduct.productCategory.unit.weight
      const productCategory = orginProduct.productCategory._id
      let qtyToMin = 0
      if (product.manualPrice) {
        const price = product.price
        const sellingPrice = orginProduct.productCategory.sellingPrice
        qtyToMin = ((price * unitWeight) / sellingPrice) / unitWeight
      } else {
        const qty = product.qty
        const ratioPerUnit = orginProduct.ratioPerUnit
        qtyToMin = (qty * ratioPerUnit) / unitWeight
      }
      const productCategoryInStock = await Stock.findOne({ productCategory })
      productCategoryInStock.qty -= qtyToMin
      return productCategoryInStock.save()
    })
    Promise.all(minsAllFromStock).then(async result => {
      await Order.updateOne({ _id: data._id }, { $set: data })

      const invoiceData = {
        InvoiceType: 'order',
        ObjType: 'Order',
        data: newOrder._id,
        forType: 'Customer',
        for: newOrder.customer._id,
        amount: newOrder.totalPrice,
        createdBy: req.user._id,

      }
      if (customerObj.type == 'public') {
        if (newOrder.totalPrice > existOrder.totalPrice) {
          invoiceData.InvoiceType = 'extra'
          invoiceData.amount = newOrder.totalPrice - existOrder.totalPrice
        } else if (newOrder.totalPrice < existOrder.totalPrice) {
          invoiceData.InvoiceType = 'return'
          invoiceData.amount = existOrder.totalPrice - newOrder.totalPrice
        } else {
          invoiceData.InvoiceType = 'exchange'
          invoiceData.amount = 0
        }

      } else {

        let customer = await Customer.findById(newOrder.customer)
        Math.abs()
        invoiceData.for = customer._id
        if (existOrder.moneyBack > newOrder.moneyBack) {
          invoiceData.InvoiceType = 'extra'
          const debit = newOrder.moneyBack - existOrder.moneyBack

          invoiceData.amount = 0
          invoiceData.oldBalance = customer.debt
          invoiceData.newBalance = invoiceData.oldBalance + ((debit <= 0) ? Math.abs(debit) : 0)
          customer.debt = invoiceData.newBalance

        } else if (existOrder.moneyBack < newOrder.moneyBack) {
          invoiceData.InvoiceType = 'return'
          const debit = newOrder.moneyBack - existOrder.moneyBack
          invoiceData.amount = 0

          invoiceData.oldBalance = customer.debt
          invoiceData.newBalance = invoiceData.oldBalance - debit
          customer.debt = invoiceData.newBalance

        } else {
          invoiceData.InvoiceType = 'exchange'
          invoiceData.amount = 0
        }
        await customer.save({ validateBeforeSave: false })

      }
      const invoice = new Invoice(invoiceData)
      await invoice.save()

      res.json(invoice)

    })




  })

})


