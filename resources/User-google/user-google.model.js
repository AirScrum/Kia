const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userGoogleSchema = new Schema({
    name: {
        type: String,
        required: true,
        },
    googleId: {
        type: String,
        required: true,
        },
    birthDate: {
        type: String,
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

const User_google = mongoose.model('User_google', userGoogleSchema);
module.exports = User_google;