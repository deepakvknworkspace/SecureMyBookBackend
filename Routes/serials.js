// routes/serials.js
const express = require('express');
const router = express.Router();
const serialCtrl = require('../Controllers/userController')

// Generate N serials for a book
router.post('/generate', serialCtrl.createBooks);
router.post("/verify-book", serialCtrl.verifyBook);
module.exports = router;
