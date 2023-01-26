const { pool } = require("../database/config.database");

const getPuestos = async (req, res) => {
    const { id } = req.params;
    const standScript = 'SELECT * FROM "PUESTOS" WHERE nivel = $1';
    const valueStand = []
    valueStand.push(id)

    try {
        const response = await pool.query(standScript, valueStand);
        res.status(200).json(response.rows)
    } catch (error) {
        console.log(error)
    }
}

const getDataPuesto = async (req, res) => {
    const { id } = req.params;
    const scriptPuesto = 'SELECT * FROM "PUESTOS" WHERE ID = $1';
    const valuePuesto = [id]

    const scriptCliente = 'SELECT * FROM "CLIENTES" WHERE DNI = $1';
    const valueCliente = []

    const scriptFinanciamiento = 'SELECT * FROM "FINANCIAMIENTOS" WHERE ID = $1';
    const valueFinanciamiento = []

    const scriptConyuge = 'SELECT * FROM "CONYUGES" WHERE DNI = $1';
    const valueConyuge = []

    const scriptVendedor = 'SELECT * FROM "USUARIOS" WHERE DNI = $1';
    const valueVendedor = []

    try {
        const responsePuesto = await pool.query(scriptPuesto, valuePuesto);

        let estadoPuesto = responsePuesto.rows[0].estado
        let cliente_id = responsePuesto.rows[0].fk_cliente
        let financiamiento_id = responsePuesto.rows[0].fk_financiamiento

        const response = responsePuesto.rows[0]

        if ((estadoPuesto === 0 || estadoPuesto === 2) && (cliente_id !== null && cliente_id !== undefined)) {
            valueCliente.push(cliente_id)
            const responseCliente = await pool.query(scriptCliente, valueCliente)
            const cliente = responseCliente.rows[0]

            if (responseCliente.rows[0].fk_conyuge !== null || responseCliente.rows[0].fk_conyuge !== undefined) {
                valueConyuge.push(responseCliente.rows[0].fk_conyuge)
                const responseConyuge = await pool.query(scriptConyuge, valueConyuge)
                cliente.conyuge = responseConyuge.rows[0]
            }

            //BUSCAR VENDEDOR
            if (responseCliente.rows[0].fk_usu_venta !== null || responseCliente.rows[0].fk_usu_venta !== undefined) {
                valueVendedor.push(responseCliente.rows[0].fk_usu_venta)
                const responseVendedor = await pool.query(scriptVendedor, valueVendedor)
                cliente.vendedor = responseVendedor.rows[0]
            }

            response.cliente = cliente
        }

        if ( (estadoPuesto === 0 || estadoPuesto === 2) && (financiamiento_id !== null && financiamiento_id !== undefined)) {
            valueFinanciamiento.push(financiamiento_id)
            const responseFinanciamiento = await pool.query(scriptFinanciamiento, valueFinanciamiento)
            response.financiamiento = responseFinanciamiento.rows[0]
        }

        res.status(200).json(response)
    } catch (error) {
        console.log(error)
    }
}

const createDataPuesto = async (req, res) => {
    puesto_id = req.body.id;
    comentario = req.body.comentario
    puesto = req.body
    cliente = req.body.cliente
    financiamiento = req.body.financiamiento
    conyuge = cliente.conyuge
    vendedor_id = cliente.vendedor.dni

    const scriptPuesto = 'SELECT * FROM "PUESTOS" WHERE ID = $1'
    const scriptPuestoUpdate = 'UPDATE "PUESTOS" SET nro_local = $1, ancho = $2, largo = $3, previo_venta = $4, estado = $5, fk_cliente = $6, fk_financiamiento = $7, comentario = $8 WHERE id = $9'
    const scriptCliente = 'INSERT INTO "CLIENTES"(dni, nombre, apaterno, amaterno, celular, correo, estado_civil, direccion, fk_conyuge, fk_usu_venta) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);'
    const scriptFinanciamiento = 'INSERT INTO "FINANCIAMIENTOS"(id, imp_separacion, saldo_inicial, financiamiento, fecha_separacion, fecha_saldo_inicial, fecha_financiamiento) VALUES ($1, $2, $3, $4, $5, $6, $7);'
    const scriptConyuge = 'INSERT INTO "CONYUGES"(dni, nombre, apaterno, amaterno, celular, correo) VALUES ($1, $2, $3, $4, $5, $6);'
    const scriptVendedor = 'SELECT * FROM "USUARIOS" WHERE DNI = $1'

    const valuePuesto = []
    const valuePuestoUpdate = []
    const valueCliente = []
    const valueFinanciamiento = []
    const valueConyuge = []
    const valueVendedor = []

    conyuge_id = null
    cliente_id = null

    if (puesto_id !== null || puesto_id !== undefined) {
        //BUSCAMOS VENDEDOR
        valuePuesto.push(puesto_id)

        const responsePuestoExiste = await pool.query(scriptPuesto, valuePuesto)

        if (responsePuestoExiste.rows.length === 0) {
            res.status(400).json({"error":"No se encontro puesto especificado"})
        }

        if (conyuge !== null && conyuge !== undefined) {
            //CREACION DE CONYUGE
            valueConyuge.push(conyuge.dni)
            valueConyuge.push(conyuge.nombre)
            valueConyuge.push(conyuge.apaterno)
            valueConyuge.push(conyuge.amaterno)
            valueConyuge.push(conyuge.celular)
            valueConyuge.push(conyuge.correo)
    
            const responseConyuge = await pool.query(scriptConyuge, valueConyuge)
    
            if (responseConyuge.rowCount !== 1) {
                res.status(400).json({"error":"Ocurrio un error al crear conyuge"})
            }
    
            conyuge_id = conyuge.dni
        }
    
        if (vendedor_id !== null && vendedor_id !== undefined) {
            //BUSCAMOS VENDEDOR
            valueVendedor.push(vendedor_id)
    
            const responseConyuge = await pool.query(scriptVendedor, valueVendedor)
    
            if (responseConyuge.rows.length === 0) {
                res.status(400).json({"error":"No se encontro vendedor con dni especificado"})
            }
        } else {
            res.status(400).json({"error":"El vendedor no puede ser vacio"})
        }
    
        if (cliente !== null && cliente !== undefined) {
            //CREACION DE CONYUGE
            valueCliente.push(cliente.dni)
            valueCliente.push(cliente.nombre)
            valueCliente.push(cliente.apaterno)
            valueCliente.push(cliente.amaterno)
            valueCliente.push(cliente.celular)
            valueCliente.push(cliente.correo)
            valueCliente.push(cliente.estado_civil)
            valueCliente.push(cliente.direccion)
            valueCliente.push(conyuge_id)
            valueCliente.push(vendedor_id)
    
            const responseCliente = await pool.query(scriptCliente, valueCliente)
    
            if (responseCliente.rowCount !== 1) {
                res.status(400).json({"error":"Ocurrio un error al crear cliente"})
            }
    
            cliente_id = cliente.dni
        } else {
            res.status(400).json({"error":"El cliente no puede ser vacio"})
        }
    
        if (financiamiento !== null && financiamiento !== undefined) {

            // financiamiento.financiamiento = parseInt(financiamiento.financiamiento.substr(3));
            // console.log(financiamiento.financiamiento);

            //CREACION DE CONYUGE
            valueFinanciamiento.push(puesto_id + '_F')
            valueFinanciamiento.push(financiamiento.imp_separacion)
            valueFinanciamiento.push(financiamiento.saldo_inicial)
            valueFinanciamiento.push(financiamiento.financiamiento)
            valueFinanciamiento.push(financiamiento.fecha_separacion)
            valueFinanciamiento.push(financiamiento.fecha_saldo_inicial)
            valueFinanciamiento.push(financiamiento.fecha_financiamiento)
    
            const responseFinanciamiento = await pool.query(scriptFinanciamiento, valueFinanciamiento)
    
            if (responseFinanciamiento.rowCount !== 1) {
                res.status(400).json({"error":"Ocurrio un error al crear financiamiento"})
            }
        } else {
            res.status(400).json({"error":"El financiamiento no puede ser vacio"})
        }

        valuePuestoUpdate.push(puesto.nro_local)
        valuePuestoUpdate.push(puesto.ancho)
        valuePuestoUpdate.push(puesto.largo)
        valuePuestoUpdate.push(puesto.previo_venta)
        valuePuestoUpdate.push(puesto.estado)
        valuePuestoUpdate.push(cliente_id)
        valuePuestoUpdate.push(puesto_id + '_F')
        valuePuestoUpdate.push(comentario)
        valuePuestoUpdate.push(puesto_id)
        const responsePuestoUpdate = await pool.query(scriptPuestoUpdate, valuePuestoUpdate)

        if (responsePuestoUpdate.rowCount !== 1) {
            res.status(400).json({"error":"Ocurrio un error al actualizar puesto"})
        } else {
            res.status(200).json(responsePuestoUpdate.rowCount)
        }
    } else {
        res.status(400).json({"error":"El puesto no puede ser vacio"})
    }
}

module.exports = {
    getPuestos,
    getDataPuesto,
    createDataPuesto
}