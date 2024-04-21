const mongoose = require('mongoose');
const { Schema } = mongoose;

const customerSchema = new Schema({
    name: String,
    email: { type: String, unique: true }
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
