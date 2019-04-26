// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');

// Inicializar variables
var app = express();

// Body parser
// parse application/x-ww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos on port 27017: \x1b[32m%s\x1b[0m', 'online');
});

// rutas -> Middelware
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3001, () => {
    console.log('Express server on port 3001: \x1b[32m%s\x1b[0m', 'online');
});