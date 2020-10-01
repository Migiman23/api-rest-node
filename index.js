'use strict'

require('./config');

const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT // || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true})
        .then(() => {
            console.log("Conexión a base dedatos correcta")
            //Crear el servidor si se conecta primero a la base de datos
            app.listen(port, () =>{
                console.log('El servidor localhost:3999 está funcionando correctamente!')
            })
        })
        .catch(error => console.log(error));