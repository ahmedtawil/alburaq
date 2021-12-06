const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const {killogramUnitID} = require('../configs/constants')

const productSchema = new Schema({
    serialNumber: {
        type: String,
    },
    name: {
        type: String,
        required: [true, 'اسم المنتج مطلوب'],
        trim: true
    },
    productCategory: { type: Schema.Types.ObjectId, ref: 'productCategory', required: [true, 'صنف المنتج مطلوب.'] },
    ratioPerUnit: {
        type: Number,
        required: async function (val) {
            const productCategory = await mongoose.model('ProductCategory').findById(this.productCategory)
            if(productCategory.unit == killogramUnitID){
                return false
            }
            return [true, 'نسبه قيمة المنتج للوحدة مطلوبة.']
        },
    },

    price: {
        type: Number,
        required: function (val) {
            if(!this.ratioPerUnit){
                return false
            }
            return [true, 'سعر البيع مطلوب.']
        }
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

module.exports = mongoose.model('Product', productSchema)