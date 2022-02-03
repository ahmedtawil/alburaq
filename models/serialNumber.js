const mongoose = require('mongoose')
const { Schema } = mongoose;
const moment = require('moment')

const serialNumberSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    counter: {
        type: Number,
        required: true,
        default:1000000
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

   
  
  
})

serialNumberSchema.statics.newProduct = async function () {
    const productCounter = await mongoose.model('SerialNumber').findOne({uid:'products'})
    productCounter.counter++
    await productCounter.save()
    return productCounter.counter
}

serialNumberSchema.statics.newInvoice = async function () {
    const invoiceCounter =  await mongoose.model('SerialNumber').findOne({uid:'invoices'})
    invoiceCounter.counter++
    await invoiceCounter.save()
    return invoiceCounter.counter
}

serialNumberSchema.statics.newOrder = async function () {
    const orderCounter =  await mongoose.model('SerialNumber').findOne({uid:'orders'})

    orderCounter.counter++
    await orderCounter.save()
    return orderCounter.counter
}

serialNumberSchema.statics.newImport = async function () {
    const orderCounter =  await mongoose.model('SerialNumber').findOne({uid:'imports'})

    orderCounter.counter++
    await orderCounter.save()
    return orderCounter.counter
}




module.exports = mongoose.model('SerialNumber', serialNumberSchema)