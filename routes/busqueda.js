let express = require('express');
const Hospital = require('./../models/hospital');
const Medico = require('./../models/medico');
const Usuario = require('./../models/usuario');

let app = express();

//=============================
// Búsqueda por tabla/colección
//=============================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    let busqueda = req.params.busqueda;
    let tabla = req.params.tabla;
    let regex = new RegExp(busqueda, 'i');
    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de búsqueda solo son: usuarios, medicos, hospitales',
                error: { mesage: 'Tipo de Tabla/Colección no válido' }
            });
    }

    promesa.then(resultados => {
        res.status(200).json({
            ok: true,
            [tabla]: resultados
        });
    });
});

//=============================
// Búsqueda general
//=============================
app.get('/todo/:busqueda', (req, res, next) => {
    let busqueda = req.params.busqueda;
    // Expresión regular: i -> Case-insensitive = ignora mayúsculas
    let regex = new RegExp(busqueda, 'i');

    // Un arreglo de promesas
    Promise.all([
        buscarHospitales(regex),
        buscarMedicos(regex),
        buscarUsuarios(regex)
    ]).then(resultados => {
        res.status(200).json({
            ok: true,
            hospitales: resultados[0],
            medicos: resultados[1],
            usuarios: resultados[2]
        });
    })
});

// Realizar una búsqueda en la tabla hospitales
function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al buscar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            })
    });
}

// Realizar una búsqueda en la tabla médicos
function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {
                if (!err) {
                    resolve(medicos);
                } else {
                    reject('Error al buscar medicos', err);
                }
            });
    });
}

// Realizar una búsqueda en la tabla usuarios
function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email img role google')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (!err) {
                    resolve(usuarios);
                } else {
                    reject('Error al buscar usuarios', err);
                }
            });
    });
}

module.exports = app;