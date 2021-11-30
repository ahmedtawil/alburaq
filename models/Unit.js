const mongoose = require('mongoose')
const { Schema } = mongoose;
const unitSchema = new Schema({
    title: {
        type: String,
        required: [true, 'اسم الزبون مطلوب'],
        trim: true
    },
    weight: {
        type: Number,
        required: [true, 'القيمة الوزنية للوحدة مطلوبة'],
    }
   
  
  
})

module.exports = mongoose.model('Unit', unitSchema)