const mongoose = require('mongoose')
const { Schema } = mongoose;
const productCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, 'اسم الصنف مطلوب'],
        trim: true
    },
    unit: {
        type: String,
        required: [true, 'وحدة قياس المنتج مطلوبة.'],
        
    },
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
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: [true , 'اسم المزود مطلوب'] }
   
  
  
})

module.exports = mongoose.model('ProductCategory', productCategorySchema)