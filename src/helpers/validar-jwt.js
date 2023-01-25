const jwt = require("jsonwebtoken");
const { response, request } = require("express");
const { pool } = require("../database/config.database");

const validarJWT = async (req = request, res = response, next) => {
    const token = req.header("x-token");

    if (!token) {
        return res.status(401).json({
            msg: "no hay token en la petición",
        });
    }

    try {
        const { uid } = jwt.verify(token, "Est03sMyPubl1cK");

        //leer el usuario que corresponde al uid
        const userScript = 'SELECT * FROM "USUARIOS" WHERE DNI = $1'
        const valueUser = [uid]
        const rsUser = await pool.query(userScript, valueUser)
        const usuario = rsUser.rows[0]

        if (usuario === null || usuario === undefined) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe DB'
            })
        }

        //Verificar si el uid tiene estado tru
        if (usuario.estado !== 1) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no se encuentra activo'
            })
        }

        next();
    } catch (err) {
        console.log(err);
        return res.status(401).json({
            msg: "Token no válido"
        })
    }

};

module.exports = {
    validarJWT,
};
