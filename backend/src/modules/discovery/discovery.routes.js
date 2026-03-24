const express = require('express');

const checkJwt = require('../../middlewares/auth0.middleware');

const controller = require('./discovery.controller');

const router = express.Router();

router.get('/feed', checkJwt, controller.getFeed);
router.post('/swipe', checkJwt, controller.swipe);

module.exports = router;
