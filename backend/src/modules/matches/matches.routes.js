const express = require("express");
const checkJwt = require("../../middlewares/auth0.middleware");
const controller = require("./matches.controller");

const router = express.Router();

router.get("/me", checkJwt, controller.getMyMatches);

module.exports = router;
