const mongoose = require('mongoose')
const { Schema } = mongoose;
const moment = require('moment')
const customerSchema = new Schema({
    name: {
        type: String,
        required: [true, 'اسم الزبون مطلوب'],
        trim: true
    },
    formalID: {
        type: String,
        required: [true, 'رقم هوية الزبون مطلوبة'],
        validate:
        [
            {
                validator: async function (formalID) {
                    const customer = await this.constructor.findOne({ formalID });
                    if (customer) {

                        if (this.id == customer.id) {
                            return true;
                        }
                        return false;
                    }
                    return true
                },
                message: "هوية الزبون موجودة مسبقاً"
            }, {
                validator: function (formalID) {
                    return !isNaN(Number(formalID)) && formalID.indexOf('0') != 0

                },
                message: "رقم هوية الزبون غير صالحة"
            }
        ],
        trim: true
    },
    type:{
        type:String,
        required: [true, 'نوع الزبون مطلوب.'],
        enum:['public' , 'wholesaler' , 'credit']

    },
    phoneNumber: {
        type: String,
        required: [true, 'رقم جوال الزبون مطلوب'],
        validate: {
            validator: function (v) {
                return !isNaN(Number(v)) && (v.indexOf('059') == 0 || v.indexOf('056') == 0)
            },
            message: "رقم جوال الزبون غير صالح."
        },
        trim: true
    },
    address: {
        type: String,
        required: [true, 'عنوان الزبون مطلوب'],
    }
    ,
    debt: {
        type: Number,
        default:0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
   
  
  
})

module.exports = mongoose.model('Customer', customerSchema)