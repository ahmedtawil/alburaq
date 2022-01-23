const mongoose = require('mongoose')
const { Schema } = mongoose;
const moment = require('moment')

const stockSchema = new Schema({
    productCategory: { type: Schema.Types.ObjectId, ref: 'ProductCategory', required: [true, 'الصنف مطلوب.'] }
    ,
    qty: {
        type: Number,
        default:0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

   
  
  
})



module.exports = mongoose.model('Stock', stockSchema)