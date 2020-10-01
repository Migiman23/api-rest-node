'use strict'
var Topic = require('../models/topic')
var validator = require('validator');

var controller = {
    save: function(req, res) {

        var topicId = req.params.topicId;

        Topic.findById(topicId).exec((err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el topic'
                });
            }

            if(req.body.content) {

                try{
                    var validate_content = !validator.isEmpty(req.body.content);
                } catch(err) {
                    return res.status(200).send({
                        status: 'error',
                        message: 'El comentario está vacío'
                    });
                }
                
                if(validate_content) {

                    var comment = {
                        user: req.user.sub,
                        content: req.body.content,
                    }

                    topic.comments.push(comment);

                    topic.save((err) => {

                        if(err) {
                            return res.status(500).send({
                                status: 'error',
                                message: 'Error al guardar el comentario'
                            });
                        }

                        return res.status(200).send({
                            status: 'sucess',
                            topic
                        });
                    });

                } else {
                    return res.status(200).send({
                        status: 'error',
                        message: 'Error al válidar el comentario'
                    });
    
                }
            } else {
                return res.status(200).send({
                    status: 'error',
                    message: 'Error de contenido'
                });

            }
        }); 
    },
    update: function(req, res) {
        var commentId = req.params.id;

        try{
            var validate_content = !validator.isEmpty(req.body.content);
        } catch(err) {
            return res.status(200).send({
                status: 'error',
                message: 'El comentario está vacío'
            });
        }
        
        if(validate_content) {

            Topic.findOneAndUpdate(
                { 'comments._id': commentId },
                {
                        '$set': {
                            'comments.$.content': req.body.content
                        }
                },
                {new: true},
                (err, topicUpdated) =>{
                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error en la petición'
                        });
                    }
        
                    if(!topicUpdated){
                        return res.status(404).send({
                            status: 'error',
                            message: 'Error al intentar actualizar'
                        });
                    }

                    return res.status(200).send({
                        message: 'sucess',
                        topicUpdated
                    });
        
                })
        } else {
            return res.status(200).send({
                message: 'funca'
            });
        }
    },
    delete: function(req, res) {
        var topicId = req.params.topicId;
        var commentId = req.params.commentId;

        Topic.findById(topicId, (err, topic) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topic){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el topic'
                });
            }

            var comment = topic.comments.id(commentId); // Se obtiene el comentario de la lista de comentarios del topic
            if(comment){
                comment.remove();
                topic.save((err) => {

                    if(err){
                        return res.status(500).send({
                            status: 'error',
                            message: 'Error al intentar guardar'
                        });
                    }
                    return res.status(200).send({
                        status: 'sucess',
                        topic
                    });
                });
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el comentario'
                });
            }
        });
    }

}
module.exports = controller;