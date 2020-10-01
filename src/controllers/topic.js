'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    save: function(req, res) {
        var params = req.body;

        try {
            var validate_tittle = !validator.isEmpty(params.tittle);
            var validate_content= !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(err) {
            return res.status(200).send({
                message: 'Faltan datos'
            })
        }

        if(validate_tittle && validate_content, validate_lang){
            var topic = new Topic();

            topic.tittle = params.tittle;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
            topic.user = req.user.sub; // Se extrae el usuario logeado mediante el token 

            topic.save((err, topicStored) => {
                if(err || !topicStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'
                    })
                }
                return res.status(200).send({
                    status: 'sucess',
                    topic: topicStored
                })
            })
        } else{
            return req.status(200).send({
                message: 'Los datos no son válidos'
            })
        }

    },
    getTopics: function(req, res){
        // Obtener pagina actual
        var page;
        if(!req.params.page || req.params.page == 0 || req.params.page == '0') {
            console.log('page:'+page)
            page = 1;
        } else {
            page = parseInt(req.params.page);
        }
 
        // Opciones de paginación
        var options = {
            sort: {date: -1},
            populate: 'user',
            limit: 5,
            page: page
        };
        // Procesar el paginado
        Topic.paginate({}, options, (err, topics) => {

            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Eror al realizar la consulta'
                })
            }
            if(!topics) {
                return res.status(404).send({
                    status: 'not found',
                    message: 'No existen registros'
                })
            }
            return res.status(200).send({
                status: 'sucess',
                topics: topics.docs,
                total: topics.totalDocs,
                totalPages: topics.totalPages
            })
        });
    },
    getTopicsByUser: function(req, res) {
        // Obtener usuario
        var userId = req.params.user;
        // Buscar topics por usuario
        Topic.find({
            user:userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Eror al realizar la consulta'
                })
            }

            if(!topics) {
                return res.status(404).send({
                    status: 'not found',
                    message: 'No existen registros'
                })
            }

            return res.status(200).send({
                status: 'sucess',
                topics
            })
        });
    },
    getTopicById: function(req, res){
        var topicId = req.params.id;

        Topic.findById(topicId)
             .populate('user')
             .exec((err, topic) => {
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Eror al realizar la consulta'
                    })
                }
    
                if(!topic) {
                    return res.status(404).send({
                        status: 'not found',
                        message: 'No existe el registro'
                    })
                }
    
                return res.status(200).send({
                    status: 'sucess',
                    topic
                })
             });
    },
    update: function(req, res){
        var topicId = req.params.id;
        var params = req.body;
        try{
            var validate_tittle = !validator.isEmpty(params.tittle);
            var validate_content= !validator.isEmpty(params.content);
            var validate_lang = !validator.isEmpty(params.lang);
        }catch(err) {
            return res.status(200).send({
                message: 'Faltan datos'
            })
        }
        if(validate_tittle && validate_content && validate_lang) {
            var update ={
                tittle: params.tittle,
                content: params.content,
                code: params.code,
                lang: params.lang
            }
            Topic.findOneAndUpdate({_id:topicId, user:req.user.sub}, update, {new: true}, (err, topic) =>{
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    })
                }

                if(!topic){
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    })
                }
                return res.status(200).send({
                    status: 'sucess',
                    topic
                })
            });
           
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Error en válidación de datos'
            })
        }
    },
    delete: function(req, res){
        var topicId = req.params.id;

        Topic.findOneAndDelete({_id:topicId, user: req.user.sub},(err, topicRemoved) => {
            
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                })
            }

            if(!topicRemoved){
                return res.status(404).send({
                    status: 'error',
                    message: 'Error al actualizar'
                })
            }
            return res.status(200).send({
                status: 'sucess',
                topicRemoved
            })
        })
    },
    search: function (req, res) {
        var searchString = req.params.search;

        Topic.find({'$or': [
                {'tittle': {'$regex': searchString, '$options': 'i'} },
                {'content': {'$regex': searchString, '$options': 'i'} },
                {'code': {'$regex': searchString, '$options': 'i'} },
                {'lang': {'$regex': searchString, '$options': 'i'} }
            ]})
            .sort([['date', 'descending']])
            .exec((err, topics) => {
                if(err){
                    return res.status(500).send({
                        message: 'Error en la petición'
                    });
                }
                
                if(!topics){
                    return res.status(404).send({
                        message: 'No existen registros'
                    });
                }

                return res.status(200).send({
                    status: 'sucess',
                    topics
                });
            });
    }
} 

module.exports = controller;