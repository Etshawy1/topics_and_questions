const express = require('express');
const topicController = require('../controllers/topicController');

const router = express.Router();

router.get('/', topicController.getQuestions);

module.exports = router;
