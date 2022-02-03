const mongoose = require('mongoose')
const { Schema } = mongoose;
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    name:{
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        trim: true
    }

})
// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}
module.exports = mongoose.model('User', userSchema)