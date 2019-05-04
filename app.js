// Requires
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
const { DB_HOST, DB_PORT, DB_NAME } = require('./config/config');
const connectionUrl = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// importar rutas
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuario');
let hospitalRoutes = require('./routes/hospital');
let medicoRoutes = require('./routes/medico');
let loginRoutes = require('./routes/login');

// Inicializar variables
let app = express();

// Body parser
// parse application/x-ww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Conexion a la base de datos
mongoose.connection.openUri(connectionUrl, { useNewUrlParser: true, useCreateIndex: true }, (err, res) => {
    if (err) throw err;
    console.log(`Base de datos on port ${DB_PORT}: \x1b[32m%s\x1b[0m`, 'online');
});

// rutas -> Middelware
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3001, () => {
    console.log('Express server on port 3001: \x1b[32m%s\x1b[0m', 'online');
});