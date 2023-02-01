const { pool } = require("../database/config.database");

const getPuestosVendidos = async (req, res) => {
    try {
        const nombre_completo = "(C.nombre || ' ' || C.apaterno)"
        const vendedor = "(U.nombre || ' ' || U.apaterno)"
        const response = await pool.query('SELECT P.id AS "ID", P.nro_local AS "NRO_LOCAL", C.dni AS "DNI", ' + nombre_completo + ' AS "CLIENTE", C.celular AS "CELULAR", P.previo_venta AS "PRECIO_VENTA", C.correo AS "CORREO", F.imp_separacion AS "IMP_SEPARACION", F.saldo_inicial AS "SALDO_INICIAL", F.financiamiento AS "FINANCIAMIENTO", (P.previo_venta - F.financiamiento) AS "SALDO_PENDIENTE", ' + vendedor + ' AS "VENDEDOR", P.comentario AS "COMENTARIO" FROM "PUESTOS" P, "CLIENTES" C, "FINANCIAMIENTOS" F, "USUARIOS" U WHERE P.fk_cliente = C.dni AND C.fk_usu_venta = U.dni AND P.fk_financiamiento = F.id');

        console.log(response)

        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getPuestosVendidos
}