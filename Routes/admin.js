// routes/serials.js
const express = require('express');
const router = express.Router();


const adminCtrl = require('../Controllers/adminController')
const { verifyToken } = require("../Middleware/authenticate");
//router.post("/register", adminCtrl.registerUser);
router.post("/login", adminCtrl.loginUser);
router.get("/stats",verifyToken, adminCtrl.getBookStats);
module.exports = router;
