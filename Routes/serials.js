// routes/serials.js
const express = require('express');
const router = express.Router();
const serialCtrl = require('../Controllers/userController')
// Generate N serials for a book
router.post('/generate', serialCtrl.generateBooks);
router.post("/verify-book", serialCtrl.verifyBook);

router.get('/geturl',serialCtrl.getUnverifiedBookUrls )
router.get('/errorbooks',serialCtrl.getAllErrorBooks)
//router.get('/fillVerifiedAtForVerifiedBooks',serialCtrl.fillVerifiedAtForVerifiedBooks)
module.exports = router;
