const mongoose = require('mongoose')
const { Schema } = mongoose;
const moment = require('moment')

const serialNumberSchema = new Schema({
    productsCounter: {
        type: Number,
    },
    invoicesCounter: {
        type: Number,
    },
    ordersCounter: {
        type: Number,
    },
    importsCounter: {
        type: Number,
    }
})

serialNumberSchema.statics.newProduct = async function () {
    const serialNumbers = await this.findOne()
    serialNumbers.productsCounter++
    await serialNumbers.save()
    return serialNumbers.productsCounter
}

serialNumberSchema.statics.newInvoice = async function () {
    const serialNumbers = await this.findOne()
    serialNumbers.invoicesCounter++
    await serialNumbers.save()
    return serialNumbers.invoicesCounter
}

serialNumberSchema.statics.newOrder = async function () {
    const serialNumbers = await this.findOne()

    serialNumbers.ordersCounter++
    await serialNumbers.save()
    return serialNumbers.ordersCounter
}

serialNumberSchema.statics.newImport = async function () {
    const serialNumbers = await this.findOne()
    serialNumbers.importsCounter++
    await serialNumbers.save()
    return serialNumbers.importsCounter
}




module.exports = mongoose.model('SerialNumber', serialNumberSchema)