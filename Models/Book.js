// const mongoose = require('mongoose');

// const bookSchema = new mongoose.Schema({
//   serialNumber: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   verified: {
//     type: Boolean,
//     default: false,
//   },
//   bookName: {
//     type: String,
//     required: true,
//   },
//   userName: {
//     type: String,
//   },
//   phoneNumber: {
//     type: String,
//   }
// });

// module.exports = mongoose.model('Book', bookSchema);
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    unique: true,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null, // 👈 initially null
  },
  bookName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
  },
  phoneNumber: {
    type: String,
  }
}, { timestamps: true }); // optional but recommended

module.exports = mongoose.model('Book', bookSchema);
