const { pool } = require("../database/config.database")
const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generar-jwt");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Y8w2CfxC01jVtER6sgGn');

const getToken = async (req, res) => {
    
    let rs = 0

    try {
        const userScript = 'SELECT * FROM "USUARIOS" WHERE DNI = $1'
        const valueUser = [req.body.usuario]
        const rsUser = await pool.query(userScript, valueUser)
        
        if (rsUser.rows.length === 0) {
            console.log("No se encontro usuario")
            rs = 1
            res.status(400).json({"error":"No se encontro usuario"})
        }

        if (rsUser.rows[0].estado !== 1) {
            console.log("El usuario se encuentra inactivo")
            rs = 1
            res.status(400).json({"error":"El usuario se encuentra inactivo"})
        }

        let user = rsUser.rows[0].dni
        const passDecrypt = cryptr.decrypt(rsUser.rows[0].password)
        const validPass = bcryptjs.compareSync(req.body.password, rsUser.rows[0].password)
        
        if (req.body.password === passDecrypt) {
            const token = await generarJWT(user, rsUser.rows[0].rol);

            res.json({
                user,
                token
            });
        } else {
            rs = 1
            res.status(400).json({"error":"La contraseña ingresada es incorrecta"})
        }    
    } catch (e) {
        if (rs === 0) {
            res.status(400).json({"error":"Ocurrio un error al intentar autenticarse"})
        }   
    }
}

module.exports = {
    getToken
}