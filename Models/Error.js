const mongoose = require('mongoose');

const errorSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    ref: "Book",   // Reference to Book schema
    required: true
  },
  bookName: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  errorMessage: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ErrorBook", errorSchema);
