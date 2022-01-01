const mongoose = require('mongoose')
const { Schema } = mongoose;
const stockSchema = new Schema({
    productCategory: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: [true, 'الصنف مطلوب.'] }
    ,
    qty: {
        type: Number,
        default:0
    }
   
  
  
})



module.exports = mongoose.model('Stock', stockSchema)