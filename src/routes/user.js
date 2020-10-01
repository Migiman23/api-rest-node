'use strict'
var express = require('express');
var UserController = require('../controllers/user');

var router = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './src/uploads/users'});

router.get('/prueba', UserController.prueba);
router.get('/prueba2', UserController.prueba2);

router.get('/users', UserController.getUsers);
router.get('/user/:id', UserController.getUsers);
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/image/:fileName', UserController.getAvatar);

module.exports = router;