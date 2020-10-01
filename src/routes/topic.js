'use strict'
var express = require('express');
var TopicController = require('../controllers/topic');
var md_auth = require('../middlewares/authenticated');

var router = express.Router();

router.get('/topic/:id', TopicController.getTopicById);
router.get('/topics/:page?', TopicController.getTopics);
router.get('/topics-user/:user', TopicController.getTopicsByUser);
router.post('/topic',md_auth.authenticated, TopicController.save);
router.put('/topic/:id',md_auth.authenticated, TopicController.update);
router.delete('/topic/:id',md_auth.authenticated, TopicController.delete);
router.get('/search/:search', TopicController.search);

module.exports = router;