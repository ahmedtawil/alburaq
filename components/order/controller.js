const mongoose = require('mongoose')
const Order = require('../../models/Order')
const Customer = require('../../models/Customer')
const Product = require('../../models/Product')
const Stock = require('../../models/Stock')

const { killogramUnitID } = require('../../configs/constants')

const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const Invoice = require('../../models/Invoice')

exports.newOrderPage = catchAsyncErrors(async (req, res, next) => {
  const customers = await Customer.find()
  const products = await Product.find()

  res.render('order/cpanel', { customers, products, killogramUnitID })
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
    const customersIDs = await Customer.find({name:qu} , {_id:1})
    const searchQuery = { $or: [{ serialNumber: qu }, { customer: {$in:customersIDs} }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }

  const ordersCount = await Order.estimatedDocumentCount()
  const ordersFillterCount = await Order.find(queryObj).countDocuments()
  const orders = await Order.find(queryObj).sort({createdAt:-1}).limit(parseInt(query.length)).skip(parseInt(query.start)).populate({ path: 'customer'})

  return res.json({
    recordsTotal: ordersCount,
    recordsFiltered: ordersFillterCount,
    orders
  })


})




exports.newOrder = catchAsyncErrors(async (req, res) => {
  const data = JSON.parse(req.body.payload)
  let customerID = data.customer
  if (customerID == 'public') {
    const publicCustomer = await Customer.findOne({type:customerID})
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
      InvoiceType: 'Order',
      data: newOrder._id,
      forType: 'Customer',
      for:newOrder._id,
      amount: newOrder.totalPrice,
    }
    if (customerID !== 'public') {
      customer = await Customer.findById(newOrder.customer)
      const debit = newOrder.totalPrice - newOrder.paidAmount
      invoiceData.for = customer._id
      invoiceData.oldBalance = customer.debt
      if (debit < 0) {
        invoiceData.newBalance = invoiceData.oldBalance
      } else {
        invoiceData.newBalance = invoiceData.oldBalance + debit
        customer.debt = invoiceData.newBalance
        await customer.save()
      }
    }
    const invoice = new Invoice(invoiceData)
    await invoice.save()

    res.end()

  })
})
// post editPage


