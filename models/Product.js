const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const moment = require('moment')
const mongooseAsync = require('mongoose-async')

const { killogramUnitID } = require('../configs/constants')
const opts = { toJSON: { virtuals: true } };

const productSchema = new Schema({
    serialNumber: {
        type: String,
    },
    name: {
        type: String,
        /*
        read: async function (value, schemaType, document) {
        }
        */
    },
    productCategory: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: [true, 'صنف المنتج مطلوب.'] },
    ratioPerUnit: {
        type: Number,
        /*
        required: async function (val) {
            const productCategory = await mongoose.model('ProductCategory').findById(this.productCategory)
            if(productCategory.unit == killogramUnitID){
                return false
            }
            return [true, 'نسبه قيمة المنتج للوحدة مطلوبة.']
        },
        */
    },

    price: {
        type: Number,
        required: function (val) {
            if (!this.ratioPerUnit) {
                return false
            }
            return [true, 'سعر البيع مطلوب.']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }





})
productSchema.pre('save', async function (next) {
    if (!this.serialNumber) {
        if (this.isNew) {
            const counter = await SerialNumber.newProduct()
            this.serialNumber = counter
        }
    }
    next()
})

productSchema.methods.getProductName = async function () {
    const productCategory = await mongoose.model('ProductCategory').findById(this.productCategory).populate('unit')
    if (productCategory.unit._id == killogramUnitID && typeof this.ratioPerUnit == 'undefined') {
        return `${productCategory.name} وزن`
    } else if (this.serialNumber == productCategory.serialNumber && typeof ratioPerUnit != 'undefined') {
        return `${productCategory.name} ${productCategory.unit.title}`
    }
    return `${productCategory.name} ${this.ratioPerUnit} ${productCategory.unit.smallTitle}`


}

productSchema.set('toJSON', { getters: true })
productSchema.set('toObject', { getters: true })


module.exports = mongoose.model('Product', productSchema)