let express = require('express');
// Librería para encriptar la password
let bcrypt = require('bcryptjs');
// modelo del usuario
let Usuario = require('./../models/usuario');

let mdAutenticacion = require('../middlewares/autenticacion');
let app = express();

//===========================
// Obtener todos los usuarios
//===========================
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        // Que se salte la cantidad 'desde' que viene por la query
        .skip(desde)
        // Paginación limitada a 5
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }
                // Agregar contador de usuarios
                Usuario.countDocuments({}, (error, conteo) => {
                    if (error) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar usuarios',
                            errors: error
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        usuarios: usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre))
                    });
                });
            }
        )
});

//========================
// Actualizar usuario       
//========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;
        usuario.password = ':)';

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            });
        });
    })

});


//========================
// Crear usuario       
//========================
app.post('/', (req, res) => {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });
    })
});


//============================
// Eliminar usuario por el id
//============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe`,
                errors: {
                    message: 'No existe un usuario con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        });
    });

});

module.exports = app;