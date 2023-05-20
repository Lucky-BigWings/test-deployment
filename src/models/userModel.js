const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  verifiedUser: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  }
});

module.exports = mongoose.model('User', userSchema);
