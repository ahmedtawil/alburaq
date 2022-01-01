const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const invoiceSchema = new Schema({
    serialNumber:{
        type:String
    },
    InvoiceType: {
        type: String,
        enum: ['Order', 'Import', 'Patch']
    },
    data: {
        type: Schema.Types.ObjectId,
        refPath: 'InvoiceType'
    },

    forType: {
        type: String,
        enum: ['Customer', 'Supplier']
    },
    for: {
        type: Schema.Types.ObjectId,
        refPath: 'forType'
    },
    amount: {
        type: Number,
    },
    oldBalance: {
        type: Number,
    },
    newBalance: {
        type: Number,
    },
    
    createdAt: {
        type: Date,
        default: new Date()
    }

    
})
invoiceSchema.pre('save', async function (next) {
    if(!this.serialNumber){
        if (this.isNew) {
            const counter = await SerialNumber.newInvoice()
            this.serialNumber = counter
        }
    }
    next()
})


module.exports = mongoose.model('Invoice', invoiceSchema)