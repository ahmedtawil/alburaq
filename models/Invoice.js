const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const moment = require('moment')
const invoiceSchema = new Schema({
    serialNumber:{
        type:String
    },
    InvoiceType:{
        type: String,
        enum: ['order', 'import', 'batch' , 'return' , 'extra' , 'exchange']
    },
    ObjType: {
        type: String,
        enum: ['Order', 'Import']
    },
    data: {
        type: Schema.Types.ObjectId,
        refPath: 'ObjType'
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
        default: Date.now
        }

    
})
invoiceSchema.pre('save', async function (next) {
        if (this.isNew) {
            const counter = await SerialNumber.newInvoice()
            this.serialNumber = counter
        }
    
    next()
})


module.exports = mongoose.model('Invoice', invoiceSchema)