const express = require("express");
const checkJwt = require("../middlewares/auth0.middleware");
const { getUserProfile } = require("./users.controllers");

const router = express.Router();

router.get("/me", checkJwt, getUserProfile);
module.exports = router;