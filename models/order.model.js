const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
  },
  productID:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product',
  },
  count:Number,
},{timestamps: true});



module.exports = mongoose.model('order', orderSchema);