let express = require('express');

// modelo del hospital
let Hospital = require('./../models/hospital');

let mdAutenticacion = require('../middlewares/autenticacion');

let app = express();

//=============================
// Obtener todos los hospitales
//=============================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        // Que se salte la cantidad desde que viene por la query
        .skip(desde)
        // Paginación limitada a 5
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (error, conteo) => {
                    if (error) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al contar hospitales',
                            errors: error
                        })
                    }
                    res.status(200).json({
                        ok: true,
                        total: conteo,
                        hospitales: hospitales
                    });
                });
            }
        )
});

//========================
// Actualizar hospital       
//========================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                // usuarioToken: req.usuario
            });
        })
    })

});


//========================
// Crear hospital       
//========================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    let body = req.body;

    let hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error creando hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            // usuarioToken: req.usuario
        });
    })
});


//============================
// Eliminar hospital por el id
//============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    let id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar un hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe`,
                errors: {
                    message: 'No existe un hospital con ese ID'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
                // usuarioToken: req.usuario
        });
    });

});

module.exports = app;