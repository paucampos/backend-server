let express = require('express');

// Librería para encriptar la password
let bcrypt = require('bcryptjs');

let jwt = require('jsonwebtoken');
let SEED = require('../config/config').SEED;

let Usuario = require('./../models/usuario');

// google
let CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

let app = express();

//==========================
// Autenticación de google
//==========================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.token;

    let googleUser = await verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                    id: usuarioBD._id
                });
            }
        } else {
            // El usuario no existe, hay que crearlo
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                    id: usuarioBD._id
                });
            });
        }
    });

    // return res.status(200).json({
    //     ok: true,
    //     mensaje: 'Todo ok',
    //     googleUser
    // });
});


//======================
// Autenticación normal
//======================
app.post('/', (req, res) => {

    let body = req.body;

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
        let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token,
            id: usuarioBD._id
        });
    });
})

module.exports = app;