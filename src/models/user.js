'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema ({
    name: String,
    username: String,
    email: String,
    password: String,
    image: String,
    role: String
});

UserSchema.methods.toJSON = function(){
    var obj = this.toObject();
    delete obj.password;
    //delete obj.email;
    return obj;
}
module.exports = mongoose.model('User', UserSchema);