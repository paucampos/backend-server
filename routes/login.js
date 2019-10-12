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
    let token = req.body.token || 'XXX';

    let googleUser = await verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        })

    Usuario.findOne({ email: googleUser.email }, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario - login',
                errors: err
            });
        }

        if (usuario) {
            if (usuario.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                usuario.password = ':)';

                let token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuario,
                    token,
                    id: usuario._id,
                    menu: obtenerMenu(usuario.role)
                });
            }
        } else {
            // El usuario no existe por correo, hay que crearlo
            let usuario = new Usuario();

            usuario.nombre = usuario.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                console.log("usuarioBD:::", usuarioBD);

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Hubo un problema con su usuario -google, intente nuevamente',
                        errors: err
                    });
                }
                let token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                    id: usuarioBD._id,
                    menu: obtenerMenu(usuarioBD.role)
                });
            });
        }
    });
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
            id: usuarioBD._id,
            menu: obtenerMenu(usuarioBD.role)
        });
    });
});

function obtenerMenu(ROLE) {
    let menu = [{
            titulo: "Principal",
            icono: "mdi mdi-gauge",
            submenu: [
                { titulo: "Dashboard", url: "/dashboard" },
                { titulo: "ProgressBar", url: "/progress" },
                { titulo: "Gráficas", url: "/graficas" },
                { titulo: "Promesas", url: "/promesas" },
                { titulo: "Rxjs", url: "/rxjs" }
            ]
        },
        {
            titulo: "Mantenimientos",
            icono: "mdi mdi-folder-lock-open",
            submenu: [
                { titulo: "Hospitales", url: "/hospitales" },
                { titulo: "Médicos", url: "/medicos" }
            ]
        }
    ];
    if (ROLE === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: "Usuarios", url: "/usuarios" });
    }
    return menu;
}

module.exports = app;