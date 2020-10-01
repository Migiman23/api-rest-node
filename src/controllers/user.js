'use strict'

var validator = require('validator');
var User = require('../models/user')
var bCrypt = require('bcrypt-nodejs');
const user = require('../models/user');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
const { exists } = require('../models/user');

var controller = {
    prueba: function (req, res) {
        return res.status(200).send({
            message: 'Prueba'
        })
    },
    prueba2: function (req, res) {
        return res.status(200).send({
            message: 'Prueba'
        })
    },
    save: function (req, res) {
        //Recoger parametros de la peticion
        var params = req.body;
        // Validar datos
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_username = !validator.isEmpty(params.username);
            var validate_email = !validator.isEmpty(params.name) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (ex) {
            console.log(params)
            return res.status(500).send({
                message: 'Falta llenar todos los campos'
            });
        }
        console.log(validate_name, validate_username, validate_email, validate_password)

        if (validate_name && validate_username && validate_email && validate_password) {
            // Crear objeto
            var user = new User();
            // Asignar valores al usuario
            user.name = params.name;
            user.username = params.username;
            user.email = params.email.toLowerCase();
            user.rol = 'ROLE_USER';
            user.image = null;
            // Comprobar si el usuario existe
            User.findOne({ email: user.email }, (err, issetUser) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error al comprobar el usuario'
                    });
                }

                if (!issetUser) { // Si no existe
                    // cifrar la contraseña
                    bCrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        user.save((err, userStored) => {
                            if (err) {
                                return res.status(500).send({
                                    message: 'Error al guardar el usuario'
                                });
                            }
                            if (!userStored) {
                                return res.status(500).send({
                                    message: 'El usuario no se ha guardado'
                                });
                            }

                            // Si no ha entrado a las condicionales
                            return res.status(200).send({
                                status: 'sucess',
                                user: userStored
                            });
                        });
                    });
                } else {
                    return res.status(200).send({
                        message: 'El usuario ya existe'
                    });
                }
            });
        } else {
            return res.status(200).send({
                message: 'Valicación de los campos incorrecta'
            })
        }
    },
    login: function (req, res) {
        // Obtener los parámetros de la petición
        var params = req.body;
        // Validar los datos
        try {
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        } catch (ex) {
            return res.status(500).send({
                message: 'Falta llenar todos los campos'
            });
        }
        if (!validate_email || !validate_password) {
            return res.status(200).send({
                message: 'Valicación de los campos incorrecta'
            })
        }
        //Buscar usuario que coincida
        User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

            if (err) {
                return res.status(500).send({
                    message: 'Error al intentar identificarse'
                });
            }
            // En caso de que no lo encuentre
            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }
            //Validar la contraseña (email & pass / bcrypt)
            bCrypt.compare(params.password, user.password, (err, check) => {
                // Si es correcto
                if (check) {
                    // Generar el token jwt
                    if (params.getToken) {
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        // Limpiar el objeto
                        user.password = undefined;
                        // Devolver los datos
                        return res.status(200).send({
                            status: 'sucess',
                            user
                        });
                    }
                } else {
                    return res.status(404).send({
                        message: 'La contraseña es incorrecta'
                    });
                }
            })

        })

    },
    update: function (req, res) {
        // Crear Midleware para comprobar el token: Método que se ejecuta antes del metodo del controlador
        //Obtener datos del usuario
        var params = req.body;
        try {
            var validate_name = !validator.isEmpty(params.name);
            var validate_username = !validator.isEmpty(params.username);
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
        } catch (ex) {
            return res.status(500).send({
                message: 'Falta llenar todos los campos'
            });
        }
        //Eliminar propiedades innecesarias
        delete params.password;
        var userId = req.user.sub;
        //console.log(userId);
        // Comprobar si el email es unico
        if (req.user.email != params.email) {
            User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

                if (err) {
                    return res.status(500).send({
                        message: 'Error al intentar identificarse'
                    });
                }
                // En caso de que no lo encuentre
                if (user && user.email == params.email) {
                    return res.status(200).send({
                        message: 'El email no puede ser modificado'
                    });
                } else {
                    //Buscar y actualizar 
                    User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {

                        if (err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al actualizar usuario'
                            });
                        }

                        if (!userUpdated) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'No se ha actualizado el usuario'
                            });
                        }

                        return res.status(200).send({
                            status: 'sucess',
                            user: userUpdated
                        });
                    });
                }
            });
        } else {
            //Buscar y actualizar 
            User.findOneAndUpdate({ _id: userId }, params, { new: true }, (err, userUpdated) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    });
                }

                if (!userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se ha actualizado el usuario'
                    });
                }

                return res.status(200).send({
                    status: 'sucess',
                    user: userUpdated
                });
            });
        }
    },
    uploadAvatar: function (req, res) {
        //Configurar el modulo multiparty
        // Recoger el fichero de la petición
        var file_name = 'Avatar no subido...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });
        }
        // Conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        console.log(file_path)
        //** En linux o mac solo una / */
        var file_split = file_path.split('\\');
        var file_name = file_split[3];
        //Comprobar extencion (sólo imagenes) sino borrar fichero subido
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        console.log(file_split)

        if (file_ext != 'png' && file_ext != 'jpeg' && file_ext != 'jpg' && file_ext != 'gif') {
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión del archivo no es válido'
                });
            })
        } else {
            // Obtener id del usuario
            var userId = req.user.sub;
            //Buscar y actualizar documento bs
            User.findOneAndUpdate({ _id: userId }, { image: file_name }, { new: true }, (err, userUpdated) => {
                if (err || !userUpdated) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al subir la imagen'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    user: userUpdated
                });
            })
        }
    },
    getUsers: function (req, res) {
        var userId = req.params.id;
        console.log(req.params)
        if (!userId) {
            User.find().exec((err, users) => {
                if (err || !users) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existen registros'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    users
                });
            });
        } else {
            User.findById(userId).exec((err, user) => {
                if (err || !user) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el usuario'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    user
                });
            });
        }
    },
    getAvatar: function (req, res) {
        var fileName = req.params.fileName;
        var pathFile = './src/uploads/users/' + fileName;

        fs.stat(pathFile, (err, stat) => {
            if (!err) {
                return res.sendFile(path.resolve(pathFile));
            } else {
                return res.status(404).send({
                    message: 'El archivo no existe'
                });
            }
        });
    }
};
module.exports = controller;