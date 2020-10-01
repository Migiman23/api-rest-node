'use strict'
var jwt= require('jwt-simple');
var moment = require('moment');
var secret = 'clave-secreta-para-generar-el-token-9999';
exports.authenticated = function(req, res, next){ /// next permite que salir del middleware para seguir con el funcionamiento

    //Comprobar si llega autorizacion
    if(!req.headers.authorization){
        return res.status(403).send({
            message: 'No se encuentra el token de autentificación'
        });
    }
    //Limpiar token
    var token =req.headers.authorization.replace(/['"]+/g, '');
    // Decodificar token
    try {
        var payload= jwt.decode(token, secret);
        // Verificar la caducidad del token
        if(payload.expDateToken <= moment().unix()){
            return res.status(401).send({
                message: 'El token ha expirado'
            });
        }
    }catch(ex){
        return res.status(401).send({
            message: 'El token no es válido'
        });
    }
    //Adjuntar el usuario identificado
    req.user = payload;
    //Acción
    console.log('middleware')
    next();
}