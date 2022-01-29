const mongoose = require('mongoose')
const Invoice = require('../../models/Invoice')
const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');
const Customer = require('../../models/Customer');
const Supplier = require('../../models/Supplier');
const moment = require('moment')
const Order = require('../../models/Order');
const Import = require('../../models/Import');


// get new Program page 

exports.newSupplierPage = catchAsyncErrors(async (req, res, next) => {
  res.render('supplier/new')
})


exports.getInvoicesForCustomer = catchAsyncErrors(async (req, res, next) => {
  const query = req.query
  const customerID = req.params.customerID


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

  const invoicesCount = await Invoice.countDocuments({ forType: 'Customer', for: customerID })
  const invoices = await Invoice.find(({ forType: 'Customer', for: customerID })).find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start))
  return res.json({
    recordsTotal: invoicesCount,
    recordsFiltered: invoices.length,
    invoices
  })


})

exports.getInvoicesForSupplier = catchAsyncErrors(async (req, res, next) => {
  const query = req.query
  const SupplierID = req.params.SupplierID


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

  const invoicesCount = await Invoice.countDocuments({ forType: 'Supplier', for: SupplierID })
  const invoices = await Invoice.find(({ forType: 'Supplier', for: SupplierID })).find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start)).populate('data')
  return res.json({
    recordsTotal: invoicesCount,
    recordsFiltered: invoices.length,
    invoices
  })


})


exports.newInvoice = catchAsyncErrors(async (req, res, next) => {
  let { for: id, forType, ObjType, InvoiceType, amount } = req.body

  if (!mongoose.isValidObjectId(id)) return next(new ErrorHandler('', 404))

  const invoiceData = {
    for: id,
    forType,
    ObjType,
    InvoiceType,
    amount: parseInt(amount)
  }
  const newInvoice = new Invoice(invoiceData)


  if (forType == 'Customer') {
    switch (InvoiceType) {
      case 'batch':
        const customer = await Customer.findById(id)

        if (!customer) return next(new ErrorHandler('', 404))

        newInvoice.oldBalance = customer.debt
        newInvoice.newBalance = customer.debt - parseInt(amount)
        await newInvoice.save()
        customer.debt = newInvoice.newBalance

        customer.save()

        break;
    }

  } else if (forType == 'Supplier') {
    switch (InvoiceType) {


      case 'batch':
        const supplier = await Supplier.findById(id)
        if (!supplier) return next(new ErrorHandler('', 404))

        newInvoice.oldBalance = supplier.credit
        newInvoice.newBalance = supplier.credit - parseInt(amount)
        await newInvoice.save()
        supplier.credit = newInvoice.newBalance

        supplier.save()

        break;

    }

  }
  res.end()
})

exports.getInvoiceOrderByQuery = catchAsyncErrors(async (req, res, next) => {

  const { serialNumber } = req.query

  const invoice = await Invoice.findOne({ serialNumber: serialNumber })
  if (!invoice) return next(new ErrorHandler('الفاتورة غير موجودة!', 404))

  const order = await Order.findById(invoice.data).populate('customer')
  if (!order) return next(new ErrorHandler('الطلبية غير موجودة!', 404))

  res.json({
    success: true,
    order
  })

})
exports.getInvoiceImportByQuery = catchAsyncErrors(async (req, res, next) => {

  const { serialNumber } = req.query

  const invoice = await Invoice.findOne({ InvoiceType: 'import', serialNumber: serialNumber })
  if (!invoice) return next(new ErrorHandler('الفاتورة غير موجودة!', 404))

  const importd = await Import.findById(invoice.data).populate('supplier')
  if (!importd) return next(new ErrorHandler('الطلبية غير موجودة!', 404))

  res.json({
    success: true,
    importd
  })

})

exports.getTodayInvoicesPage = catchAsyncErrors(async (req, res, next) => {
  res.render('invoice/todayList')
})


exports.getInvoicesData = catchAsyncErrors(async (req, res, next) => {
  const query = req.query


  const queryValue = (req.query.search.value == '') ? {} : JSON.parse(query.search.value)

  let queryObj = {
    '$and': [{
      createdAt: {
        $gte: moment().startOf('day').toDate(),
        $lte: moment().endOf('day').toDate()
      }
    }]
  }


  if (queryValue.search) {
    let val = queryValue.search
    console.log(val);
    const qu = {
      $regex: val,
      $options: 'i'
    }
    const searchQuery = { $or: [{ serialNumber: qu }] }
    if (queryValue.filter) {
      queryObj.$and.push(searchQuery)
    } else {
      queryObj = searchQuery
    }
  }
  console.log(queryObj);

  const invoicesCount = await Invoice.countDocuments(queryObj)
  const invoices = await Invoice.find(queryObj).sort({ createdAt: -1 }).limit(parseInt(query.length)).skip(parseInt(query.start)).populate('for').populate('data')
  const invoicesStatistics = await Invoice.aggregate([
    [
      {
        '$match': {
          'ObjType': 'Order',
          ...queryObj
        }
      }, {
        '$project': {
          'item': 1,
          'isOrderInvoiceType': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'order'
                ]
              }, 1, 0
            ]
          },
          'isExtraInvoiceType': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'extra'
                ]
              }, 1, 0
            ]
          },
          'isReturendInvoiceType': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'return'
                ]
              }, 1, 0
            ]
          },
          'isBatchInvoiceType': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'batch'
                ]
              }, 1, 0
            ]
          },
          'orderInvoicesAmount': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'order'
                ]
              }, '$amount', 0
            ]
          },
          'extraInvoicesAmount': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'extra'
                ]
              }, '$amount', 0
            ]
          },
          'returendInvoicesAmount': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'return'
                ]
              }, '$amount', 0
            ]
          },
          'batchInvoicesAmount': {
            '$cond': [
              {
                '$eq': [
                  '$InvoiceType', 'batch'
                ]
              }, '$amount', 0
            ]
          }
        }
      }, {
        '$group': {
          '_id': '$item',
          'totalInvoicesCount': {
            '$sum': 1
          },
          'totalOrderInvoicesCount': {
            '$sum': '$isOrderInvoiceType'
          },
          'totalExtraInvoicesCount': {
            '$sum': '$isExtraInvoiceType'
          },
          'totalReturendInvoicesCount': {
            '$sum': '$isReturendInvoiceType'
          },
          'totalBatchInvoicesCount': {
            '$sum': '$isBatchInvoiceType'
          },
          'totalOrderInvoicesAmount': {
            '$sum': '$orderInvoicesAmount'
          },
          'totalExtraInvoicesAmount': {
            '$sum': '$extraInvoicesAmount'
          },
          'totalReturendInvoicesAmount': {
            '$sum': '$returendInvoicesAmount'
          },
          'totalBatchInvoicesAmount': {
            '$sum': '$batchInvoicesAmount'
          }
        }
      }
    ]
  ])
  return res.json({
    recordsTotal: invoicesCount,
    recordsFiltered: invoices.length,
    invoicesStatistics,
    invoices
  })
})



exports.getInvoiceToPrint = catchAsyncErrors(async (req, res, next) => {
  const query = req.query

  const invoiceData = await Invoice.findOne(query).populate('for').populate('data')
  res.render('invoice/print/orderInvoice'   , {invoice:invoiceData ,layout:false})
})
