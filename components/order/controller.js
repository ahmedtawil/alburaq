const mongoose = require('mongoose')
const Order = require('../../models/Order')
const Customer = require('../../models/Customer')
const Product = require('../../models/Product')
const Stock = require('../../models/Stock')

const { killogramUnitID } = require('../../configs/constants')

const ErrorHandler = require('../../utils/errorHandler');
const catchAsyncErrors = require('../../middlewares/catchAsyncErrors');

exports.newOrderPage = catchAsyncErrors(async (req, res, next) => {
  const customers = await Customer.find()
  const products = await Product.find()

  res.render('order/cpanel', { customers, products, killogramUnitID })
})

exports.newOrder = catchAsyncErrors(async (req, res) => {
  console.log(JSON.parse(req.body.payload));

  const newOrder = new Order(JSON.parse(req.body.payload))

  const order = await newOrder.populate({ path: 'productsData', populate: { path: "productCategory", populate: { path: 'unit' } } })
  const { products } = order
  const populatedProducts = order.productsData
  /*
   console.log(populatedProducts);
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
    console.log(productCategory);
    const productCategoryInStock = await Stock.findOne({productCategory})
    console.log(productCategoryInStock);
    productCategoryInStock.qty -= qtyToMin
    return productCategoryInStock.save()
  })
  Promise.all(promises).then(async result=>{
    if(newOrder.customer != 'regular' && (newOrder.paidAmount < newOrder.totalPrice)){
      const customer = await Customer.findById(newOrder.customer)
      customer.debt+=Math.abs(newOrder.totalPrice - newOrder.paidAmount)
      customer.save()
    }
    newOrder.save()
    res.end()

  })
})
// post editPage


