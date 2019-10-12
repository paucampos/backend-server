let jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;


//===========================
// Verificar token middleware      
//===========================
exports.verificaToken = function(req, res, next) {
    let token = req.query.token;
    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

        // Para ver el valor de decoded
        // res.status(200).json({
        //     ok: true,
        //     decoded
        // });
    });

}

//===========================
// Verificar admin middleware      
//===========================
exports.verificaADMIN_ROLE = function(req, res, next) {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - no es admin',
            errors: {
                message: 'No es admin, no puede hacer esto'
            }
        });
    }


}