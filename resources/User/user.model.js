const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        },
    email: {
        type: String,
        required: true,
        },
    password: {
        type: String,
        required: true,
        },
    birthDate: {
        type: Date,
        },
    phoneNo: {
        type: String,
        },
    gender: {
        type: String,
        },
    title: {
        type: String,
        },
    companyName: {
        type: String,
        },
    address: {
        type: String,
        },
    bio: {
        type: String,
        },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;