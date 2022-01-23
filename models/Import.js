const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const moment = require('moment')

const importSchema = new Schema({
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    serialNumber:{
        type:String
    },
    productCategories: [{
        _id: { type: Schema.Types.ObjectId, ref: 'ProductCategory' },
        name: {
            type: String,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        costPrice: {
            type: Number,
            required: true
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }],
    totalProductCategoriesPrice: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    moneyBack: {
        type: Number,
        required: true
    }
    ,
    createdAt: {
        type: Date,
        default: Date.now
        }

    
})
importSchema.pre('save', async function (next) {
    if(!this.serialNumber){
        if (this.isNew) {
            const counter = await SerialNumber.newImport()
            this.serialNumber = counter
        }
    }
    next()
})

importSchema.virtual('productsData',{
    ref: 'Product',
    localField: 'products._id',
    foreignField: '_id',
});


importSchema.set('toObject', { virtuals: true });
importSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('Import', importSchema)