const express = require("express");
const router = express.Router();

const signIn = require("../../controllers/authentication/signIn");
const register = require("../../controllers/authentication/register");

router.post("/register", register);
router.post("/login", signIn);

module.exports = router;
