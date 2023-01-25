const jwt = require("jsonwebtoken");

const generarJWT = (uid = "", rol = "") => {
    return new Promise((resolve, reject) => {
        const payload = { uid, rol };
        jwt.sign(payload, 'Est03sMyPubl1cK', {
            expiresIn: '365d'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            } else {
                resolve(token);
                // console.log(token);

            }
        });
    });
};

module.exports = {
    generarJWT,
};
