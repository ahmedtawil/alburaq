const mongoose = require('mongoose')
const { Schema } = mongoose;
const SerialNumber = require('./serialNumber')
const moment = require('moment')

const productCategorySchema = new Schema({
    serialNumber:{
        type:String,
    },
    name: {
        type: String,
        required: [true, 'اسم الصنف مطلوب'],
        trim: true
    },
    unit:{ type: Schema.Types.ObjectId, ref: 'Unit', required: [true , 'وحدة قياس المنتج مطلوبة.'] },
    
    costPrice: {
        type: Number,
        required: [true, 'سعر التكلفة مطلوب.'],
    }
    ,
    sellingPrice: {
        type: Number,
        required: [true, 'سعر البيع مطلوب.'],
    }
    ,
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: [true , 'اسم المزود مطلوب'] },
    createdAt: {
        type: Date,
        default: Date.now
    }

   
  
  
})
productCategorySchema.pre('save', async function (next) {
    if(!this.serialNumber){
        if (this.isNew) {
            const counter = await SerialNumber.newProduct()
            this.serialNumber = counter
        }
    }
    next()
})

module.exports = mongoose.model('ProductCategory', productCategorySchema)