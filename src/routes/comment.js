'use strict'
var CommentController = require('../controllers/Comment');
var md_auth = require('../middlewares/authenticated');
var express = require('express');

var router = express.Router();

router.post('/comment/topic/:topicId', md_auth.authenticated, CommentController.save);
router.put('/comment/:id', md_auth.authenticated, CommentController.update);
router.delete('/comment/:topicId/:commentId', md_auth.authenticated, CommentController.delete);

module.exports = router;