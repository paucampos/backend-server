var express = require('express');
// Librería para encriptar la password
var bcrypt = require('bcryptjs');
var Usuario = require('./../models/usuario');

var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne( { email:body.email}, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        
        // Verificar email
        if(!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // Verificar contraseña
        if(!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token!
        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD._id
        });
    });
})

module.exports = app;