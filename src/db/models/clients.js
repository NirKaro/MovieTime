const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Schema definition
const ClientsSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    sessionKey: {
        type: String
    },
    userOrders: {
        type: Array
    }

}, {versionKey: false, timestamps: true})

const Clients = mongoose.model('Clients', ClientsSchema);
module.exports = Clients;
