const express = require("express");

const checkJwt = require("../../middlewares/auth0.middleware");

const controller = require("./chat.controller");

const router = express.Router();

router.get("/:matchId", checkJwt, controller.Openchat);

module.exports = router;