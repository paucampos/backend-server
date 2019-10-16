/*jshint esversion: 8 */
// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { DB_HOST, DB_PORT, DB_NAME } = require('./config/config');
const connectionUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// importar rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const loginRoutes = require('./routes/login');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');

// Inicializar variables
const app = express();

// Midleware cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexion a la base de datos
mongoose.connection.openUri(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos on port ${DB_PORT}: \x1b[32m%s\x1b[0m`, 'online');
});

// rutas -> Middelware
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3001, () => {
    console.log('Express server on port 3001: \x1b[32m%s\x1b[0m', 'online');
});