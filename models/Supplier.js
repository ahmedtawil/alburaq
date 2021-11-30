const mongoose = require('mongoose')
const { Schema } = mongoose;
const supplierSchema = new Schema({
    name: {
        type: String,
        required: [true, 'اسم المورد مطلوب'],
        trim: true
    },
    formalID: {
        type: String,
        required: [true, 'رقم هوية المورد مطلوبة'],
        validate:
        [
            {
                validator: async function (formalID) {
                    const supplier = await this.constructor.findOne({ formalID });
                    if (supplier) {

                        if (this.id == supplier.id) {
                            return true;
                        }
                        return false;
                    }
                    return true
                },
                message: "هوية المورد موجودة مسبقاً"
            }, {
                validator: function (formalID) {
                    return !isNaN(Number(formalID)) && formalID.indexOf('0') != 0

                },
                message: "رقم هوية المورد غير صالحة."
            }
        ],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'رقم جوال المورد مطلوب'],
        trim: true
    }
    ,
    address: {
        type: String,
        required: [true, 'عنوان المورد مطلوب'],
    }
    ,
    credit: {
        type: Number,
        default:0
    }
   
  
  
})

module.exports = mongoose.model('Supplier', supplierSchema)