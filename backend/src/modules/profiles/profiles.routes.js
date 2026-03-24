const express = require("express");
const checkJwt = require("../../middlewares/auth0.middleware");
const controller = require("./profiles.controller");

const router = express.Router();

router.get("/me", checkJwt, controller.getMyProfile);
router.post("/me", checkJwt, controller.saveProfile);

module.exports = router;
