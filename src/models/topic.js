'use strict'

var mongoose = require('mongoose');
var mongoosePag = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

// Modelo Comment
var CommentSchema = Schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' },
});
var Comment = mongoose.model('Comment',CommentSchema);

//Modelo topic
var TopicSchema = Schema ({
    tittle: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User' },
    comments : [CommentSchema]
});

// Páginación
TopicSchema.plugin(mongoosePag);
module.exports = mongoose.model('Topic', TopicSchema);
// Tablas => Colecciones
// Registros => Documentos Tipo BSON (json binario)
//              manera rápida de trabajar con los datos del documento
