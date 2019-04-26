var express = require('express');
// Librería para encriptar la password
var bcrypt = require('bcryptjs');
var Usuario = require('./../models/usuario');
var jwt = require('jsonwebtoken');
let SEED = require('../config/config').SEED;

var app = express();

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        // Verificar email
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        // Verificar contraseña
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un JWT: json web token
        usuarioBD.password = ';)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token,
            id: usuarioBD._id
        });
    });
})

module.exports = app;