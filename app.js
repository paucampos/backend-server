// Requires
var express = require('express');

// Inicializar variables
var app = express();

// Escuchar peticiones
app.listen(3001, () => {
    console.log('Express server on port 3001: \x1b[32m%s\x1b[0m', 'online');
});