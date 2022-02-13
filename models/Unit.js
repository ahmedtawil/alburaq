const mongoose = require('mongoose')
const { Schema } = mongoose;
const moment = require('moment')

const unitSchema = new Schema({
    title: {
        type: String,
        required: [true, 'اسم الوحدة مطلوبة'],
        trim: true
    },
    smallTitle: {
        type: String,
        required: [true, 'اسم الوحدة الجزئية مطلوب.'],
        trim: true
    },
    isWeightUnit:{
        type:Boolean,
        default:false
        
    },
    weight: {
        type: Number,
        required: [true, 'القيمة الوزنية للوحدة مطلوبة'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

   
  
  
})

module.exports = mongoose.model('Unit', unitSchema)