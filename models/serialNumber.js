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


module.exports = mongoose.model('SerialNumber', serialNumberSchema)