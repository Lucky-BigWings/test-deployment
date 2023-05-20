const express = require("express");
const router = express.Router();

const { register, verify } = require('../controllers/userController')

router.post('/register', register)
router.get('/verify/:token', verify)

module.exports = router;