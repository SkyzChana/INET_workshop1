const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
    approved: { type: Boolean, default: false }
},{timestamps: true});

module.exports = mongoose.model('user', userSchema);