'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');

exports.createToken = function(user){
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        createDateToken: moment().unix(),
        expDateToken: moment().add(30, 'days').unix()
    };
    return jwt.encode(payload, 'clave-secreta-para-generar-el-token-9999');
}