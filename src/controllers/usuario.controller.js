const { pool } = require("../database/config.database");
const Cryptr = require('cryptr');
const cryptr = new Cryptr('Y8w2CfxC01jVtER6sgGn');

const getUsuarios = async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM "USUARIOS" ORDER BY DNI');

        response.rows.forEach(element => {
            let passd = cryptr.decrypt(element.password)
            element.password = passd;
        });

        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error)
    }
}

const createUsuario = async (req, res) => {
    try {
        const script = 'INSERT INTO "USUARIOS"(dni, nombre, apaterno, amaterno, password, rol) VALUES ($1, $2, $3, $4, $5, $6)'
    
        //const salt = bcryptjs.genSaltSync(10);
        //req.body.password = bcryptjs.hashSync(req.body.password, salt);
        req.body.password = cryptr.encrypt(req.body.password);

        const values = [req.body.dni, req.body.nombre, req.body.apaterno, req.body.amaterno, req.body.password, req.body.rol]
        const response = await pool.query(script, values);

        res.status(200).json(response.rowCount)
    } catch (error) {
        console.log(error)
    }
}

const getDataUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const scriptUsuario = 'SELECT * FROM "USUARIOS" WHERE DNI = $1';
        const valueUsuario = [id]
        const response = await pool.query(scriptUsuario, valueUsuario);
        res.status(200).json(response.rows[0])
    } catch (error) {
        console.log(error)
    }
}

const stateUsuario = async (req, res) => {
    usuario = req.body

    try {
        const scriptUsuario = 'UPDATE "USUARIOS" SET fecha_desactivacion = CURRENT_DATE, fecha_actualizacion = CURRENT_DATE, estado = $1 WHERE dni = $2';
        let estado;
        if (usuario.estado === 0) {
            estado = 1
        } else {
            estado = 0
        }
        const valueUsuario = [estado, usuario.dni]
        const response = await pool.query(scriptUsuario, valueUsuario);
        res.status(200).json(response.rows[0])
    } catch (error) {
        console.log(error)
    }
}

const updateUsuario = async (req, res) => {
    usuario = req.body
    try {

        if (usuario.dni !== usuario.dni_o) {
            const scriptSearchSells = 'SELECT * FROM "CLIENTES" WHERE FK_USU_VENTA = $1';
            const values = [usuario.dni_o] //dni_original
            const rs = await pool.query(scriptSearchSells, values);

            if (rs.rowCount >= 1) {
                res.status(400).json({ "error": "El usuario ya ha realizado ventas, no se puede modificar el DNI" })
            }
        }

        let pwd = cryptr.encrypt(usuario.password);
        const scriptUsuario = 'UPDATE "USUARIOS" SET dni = $1, nombre = $2, apaterno = $3, amaterno = $4, rol = $5, fecha_actualizacion = CURRENT_DATE, password = $6 WHERE dni = $7';

        const valueUsuario = [usuario.dni, usuario.nombre, usuario.apaterno, usuario.amaterno, usuario.rol, pwd, usuario.dni_o]
        const response = await pool.query(scriptUsuario, valueUsuario);
        res.status(200).json(response.rows[0])
    } catch (error) {
        console.log(error)
    }
}

const getDataUsuarioRol = async (req, res) => {
    try {
        const response = await pool.query('SELECT * FROM "USUARIOS" WHERE ROL IN (1, 3)');

        console.log(response)

        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getUsuarios,
    getDataUsuario,
    createUsuario,
    updateUsuario,
    stateUsuario,
    getDataUsuarioRol
}