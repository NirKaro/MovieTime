const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema definition

const OrderSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    movieId: {
        type: String,
        required: true
    }
},{versionKey: false, timestamps: true})

const Orders = mongoose.model('Orders' , OrderSchema);
module.exports = Orders;