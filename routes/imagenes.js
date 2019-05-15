var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

// rutas
app.get('/:tipo/:img', (req, res, next) => {
    const tipo = req.params.tipo;
    const img = req.params.img;

    // Valida tipos de colección válidos
    const tipos = ['usuarios', 'medicos', 'hospitales'];
    if (tipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo no válido',
            errors: { message: `Los tipos válidos son: ${tipos.join(', ')}.` }
        });
    }

    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {

        res.sendFile(pathImagen);
    } else {
        const pathNoImagen = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImagen);
    }
});

module.exports = app;