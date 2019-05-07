const express = require('express');
const fileUpload = require('express-fileupload');
// FileSystem
const fs = require('fs');
// Models o Schemas
const Hospital = require('./../models/hospital');
const Medico = require('./../models/medico');
const Usuario = require('./../models/usuario');

const app = express();


// Opciones por default de fileUpload
app.use(fileUpload());

// Actualizar imagen de usuario, medico u hospital
app.put('/:tipo/:id', (req, res, next) => {
    const tipo = req.params.tipo;
    const id = req.params.id;

    // Valida tipos de colección válidos
    const tipos = ['usuarios', 'medicos', 'hospitales'];
    if (tipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no válido',
            errors: { message: `Los tipos válidos son: ${tipos.join(', ')}.` }
        });
    }

    // Valida que se ha seleccionado una imagen
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó ninguna imagen',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo y extensión
    let archivo = req.files.imagen;
    let nombreArchivo = archivo.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    // Validar extensiones de imagen que serán válidas
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: { message: `Las extensiones válidas son: ${extensionesValidas.join(', ')}.` }
        });
    }

    // Guardando nombre y ruta de archivo nuevo
    let nombrePersonalizado = `${id}-${new Date().getMilliseconds()}.${extension}`;
    let path = `./uploads/${tipo}/${nombrePersonalizado}`;

    // Usar el metodo mv() para mover el archivo a algún lugar en mi servidor
    archivo.mv(path, function(err) {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error moviendo el archivo',
                errors: {
                    err,
                    message: 'El archivo no pudo ser movido.'
                }
            });
        }
        subirPorTipo(tipo, id, nombrePersonalizado, res);
    });
});


//===============
// Subir por tipo
//===============
function subirPorTipo(tipo, id, nombrePersonalizado, res) {
    switch (tipo.toLowerCase()) {
        case 'usuarios':
            esquema = Usuario;
            break;
        case 'medicos':
            esquema = Medico;
            break;
        case 'hospitales':
            esquema = Hospital;
            break;
    }

    esquema.findById(id, (err, respuesta) => {
        if (!respuesta) {
            return res.status(400).json({
                ok: false,
                mensaje: `No se encontró lo que buscabas en los ${tipo}`,
                errors: { message: `No se encontró lo que buscabas en los ${tipo}` }
            });
        }
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: `El ID: ${id} no es válido`,
                errors: {
                    message: `El ID: ${id} no es válido`,
                    err
                }
            });
        }
        const imagen = respuesta.img;
        const pathViejo = `./uploads/${tipo}/${imagen}`;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo, (err) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al borrar imagen',
                        errors: err,
                        pathViejo
                    });
                }
            });
        }

        respuesta.img = nombrePersonalizado;
        respuesta.save((err, elementoActualizado) => {
            elementoActualizado.password = ':)';
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar imagen',
                    errors: err
                });
            }
            return res.status(200).json({
                ok: true,
                mensaje: 'Imagen actualizada.',
                elementoActualizado
            });
        });
    });
}

module.exports = app;