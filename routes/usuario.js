var express = require('express');
// Librería para encriptar la password
var bcrypt = require('bcryptjs');
var Usuario = require('./../models/usuario');

var app = express();

//===========================
// Obtener todos los usuarios
//===========================
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            }
        )
});

//========================
// Actualizar usuario       
//========================
app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if(!usuario) {
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
                usuario: usuarioGuardado
            });            
        })
    })
    
});


//========================
// Crear usuario       
//========================
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
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
            usuario: usuarioGuardado
        });
    })
});


//============================
// Eliminar usuario por el id
//============================
app.delete('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

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
            usuario: usuarioBorrado
        });            
    });
    
});

module.exports = app;