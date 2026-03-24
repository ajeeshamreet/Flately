const express = require("express");
const checkJwt = require("../../middlewares/auth0.middleware");
const controller = require("./matching.controller");

const router = express.Router();

router.get("/me", checkJwt, controller.getMatches);

module.exports = router;
