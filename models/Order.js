const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const moment = require('moment')

const orderSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    serialNumber: {
        type: String
    },


    products: [{
        _id: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: {
            type: String,
            required: true
        },
        qty: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        Totalprice: {
            type: Number,
            required: true
        },
        manualPrice: {
            type: Boolean,
            default: false
        }
    }],
    totalProductsPrice: {
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
    },
    createdBy:{ type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy:{ type: Schema.Types.ObjectId, ref: 'User' },

    
    createdAt: {
        type: Date,
        default: Date.now
    }


})
orderSchema.pre('save', async function (next) {
    if (!this.serialNumber) {
        if (this.isNew) {
            const counter = await SerialNumber.newOrder()
            this.serialNumber = counter
        }
    }
    next()
})

orderSchema.virtual('productsData', {
    ref: 'Product',
    localField: 'products._id',
    foreignField: '_id',
});


orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('Order', orderSchema)