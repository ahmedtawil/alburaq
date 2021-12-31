const mongoose = require('mongoose')
const { Schema } = mongoose;
const orderSchema = new Schema({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' , required:true }
    ,
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
    }
    ,
    createdAt: {
        type: Date,
        default: new Date()
    }

    
})
orderSchema.virtual('productsData',{
    ref: 'Product',
    localField: 'products._id',
    foreignField: '_id',
});


orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });


module.exports = mongoose.model('Order', orderSchema)