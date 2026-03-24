const express = require("express");
const checkJwt = require("../../middlewares/auth0.middleware");
const controller = require("./preferences.controller");

const router = express.Router();

router.get("/me", checkJwt, controller.getMyPreferences);
router.post("/me", checkJwt, controller.saveMyPreferences);

module.exports = router;
