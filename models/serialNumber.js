const mongoose = require('mongoose')
const { Schema } = mongoose;
const serialNumberSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    counter: {
        type: Number,
        required: true,
        default:1000000
    }
   
  
  
})

serialNumberSchema.statics.newProduct = async function () {
    const productCounter = await mongoose.model('SerialNumber').findOne({name:'products'})
    productCounter.counter++
    await productCounter.save()
    return productCounter.counter
}

serialNumberSchema.statics.newInvoice = async function () {
    const invoiceCounter = await mongoose.model('SerialNumber').findOne({name:'invoices'})
    invoiceCounter.counter++
    await invoiceCounter.save()
    return invoiceCounter.counter
}

serialNumberSchema.statics.newOrder = async function () {
    const orderCounter = await mongoose.model('SerialNumber').findOne({name:'orders'})
    orderCounter.counter++
    await orderCounter.save()
    return orderCounter.counter
}



module.exports = mongoose.model('SerialNumber', serialNumberSchema)