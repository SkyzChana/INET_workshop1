const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: String,
  price: Number,
  count: Number
},{timestamps: true});

module.exports = mongoose.model('product', productSchema);