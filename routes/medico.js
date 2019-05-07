let express = require('express');

// modelo del medico
let Medico = require('./../models/medico');

let mdAutenticacion = require('../middlewares/autenticacion');
let app = express();

//===========================
// Obtener todos los medicos
//===========================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        // Se salte la cantidad 'desde' que viene por la query
        .skip(desde)
        // Paginación limitada a 5
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.countDocuments({}, (error, conteo) => {
                    if (error) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar medicos',
                            errors: error
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        medicos: medicos
                    });
                });
            }
        )
});

//========================
// Actualizar medico       
//========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                // usuarioToken: req.usuario
            });
        })
    })

});


//========================
// Crear medico       
//========================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;

    let medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            // usuarioToken: req.usuario
        });
    })
});


//============================
// Eliminar medico por el id
//============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe`,
                errors: {
                    message: 'No existe un medico con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
            // usuarioToken: req.usuario
        });
    });

});

module.exports = app;