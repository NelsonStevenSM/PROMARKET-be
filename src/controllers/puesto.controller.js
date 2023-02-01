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

        if ((estadoPuesto === 0 || estadoPuesto === 2) && (financiamiento_id !== null && financiamiento_id !== undefined)) {
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

    //SCRIPTS BUSQUEDA
    const scriptSearchPuesto = 'SELECT * FROM "PUESTOS" WHERE ID = $1'
    const scriptSearchConyuge = 'SELECT * FROM "CONYUGES" WHERE DNI = $1';
    const scriptSearchVendedor = 'SELECT * FROM "USUARIOS" WHERE DNI = $1'
    const scriptSearchCliente = 'SELECT * FROM "CLIENTES" WHERE DNI = $1'
    const scriptSearchFinanciamiento = 'SELECT * FROM "FINANCIAMIENTOS" WHERE ID = $1'

    //SCRIPTS CREACION
    const scriptCreateConyuge = 'INSERT INTO "CONYUGES"(dni, nombre, apaterno, amaterno, celular, correo) VALUES ($1, $2, $3, $4, $5, $6);'
    const scriptCreateCliente = 'INSERT INTO "CLIENTES"(dni, nombre, apaterno, amaterno, celular, correo, estado_civil, direccion, fk_conyuge, fk_usu_venta) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);'
    const scriptCreateFinanciamiento = 'INSERT INTO "FINANCIAMIENTOS"(id, imp_separacion, saldo_inicial, financiamiento, fecha_separacion, fecha_saldo_inicial, fecha_financiamiento) VALUES ($1, $2, $3, $4, $5, $6, $7);'

    //SCRIPTS UPDATE
    const scriptUpdateConyuge = 'UPDATE "CONYUGES" SET nombre = $1, apaterno = $2, amaterno = $3, celular = $4, correo = $5 WHERE dni = $6'
    const scriptUpdateCliente = 'UPDATE "CLIENTES" SET nombre = $1, apaterno = $2, amaterno = $3, celular = $4, correo = $5, estado_civil = $6, direccion = $7, fk_conyuge = $8, fk_usu_venta = $9 WHERE dni = $10;'
    const scriptUpdateFinanciamiento = 'UPDATE "FINANCIAMIENTOS" SET imp_separacion = $1, saldo_inicial = $2, financiamiento = $3, fecha_separacion = $4, fecha_saldo_inicial = $5, fecha_financiamiento = $6 WHERE id = $7;'
    const scriptUpdatePuesto = 'UPDATE "PUESTOS" SET nro_local = $1, ancho = $2, largo = $3, previo_venta = $4, estado = $5, fk_cliente = $6, fk_financiamiento = $7, comentario = $8 WHERE id = $9'

    //VALORES CREACION / ACTUALIZACION
    const valuePuesto = []
    const valueConyuge = []
    const valueVendedor = []
    const valueCliente = []
    const valueFinanciamiento = []
    
    conyuge_id = null
    cliente_id = null

    if (puesto_id !== null || puesto_id !== undefined) {

        //BUSCAMOS PUESTO
        valuePuesto.push(puesto_id)
        const rsSearchPuesto = await pool.query(scriptSearchPuesto, valuePuesto)

        if (rsSearchPuesto.rows.length === 0) {
            res.status(400).json({ "error": "No se encontro puesto especificado" })
        }

        //CONYUGE
        if (conyuge !== null && conyuge !== undefined) {
            //BUSCAMOS CONYUGE EN BASE DE DATOS
            valueConyuge.push(conyuge.dni)
            const rsSearchConyuge = await pool.query(scriptSearchConyuge, valueConyuge)

            if (rsSearchConyuge.rows.length === 0 || rsSearchConyuge.rows.length === 1) {
                //INICIAMOS VALORES CONYUGE
                valueConyuge.push(conyuge.nombre)
                valueConyuge.push(conyuge.apaterno)
                valueConyuge.push(conyuge.amaterno)
                valueConyuge.push(conyuge.celular)
                valueConyuge.push(conyuge.correo)

                if (rsSearchConyuge.rows.length === 0) {
                    // CREACION DE CONYUGE
                    const responseConyuge = await pool.query(scriptCreateConyuge, valueConyuge)
    
                    if (responseConyuge.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al crear conyuge" })
                    }
                }
    
                if (rsSearchConyuge.rows.length === 1) {
                    // ACTUALIZACION DE CONYUGE
                    valueConyuge.push(conyuge.dni)
                    valueConyuge.splice(0, 1)
                    const responseConyuge = await pool.query(scriptUpdateConyuge, valueConyuge)
    
                    if (responseConyuge.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al actualizar conyuge" })
                    }
                }

                conyuge_id = conyuge.dni
            } else {
                res.status(400).json({ "error": "Ocurrio un error al buscar conyuge" })
            }
        }

        //VENDEDOR
        if (vendedor_id !== null && vendedor_id !== undefined) {
            //BUSCAMOS VENDEDOR
            valueVendedor.push(vendedor_id)
            const rsVendedor = await pool.query(scriptSearchVendedor, valueVendedor)

            if (rsVendedor.rows.length === 0) {
                res.status(400).json({ "error": "No se encontro vendedor con dni especificado" })
            }
        } else {
            res.status(400).json({ "error": "El vendedor no puede ser vacio" })
        }

        //CLIENTE
        if (cliente !== null && cliente !== undefined) {
            //BUSCAMOS CLIENTE EN BASE DE DATOS
            valueCliente.push(cliente.dni) //VALUE 1
            const rsSearchCliente = await pool.query(scriptSearchCliente, valueCliente)

            if (rsSearchCliente.rows.length === 0 || rsSearchCliente.rows.length === 1) {
                //INICIAMOS VALORES CLIENTE
                valueCliente.push(cliente.nombre)
                valueCliente.push(cliente.apaterno)
                valueCliente.push(cliente.amaterno)
                valueCliente.push(cliente.celular)
                valueCliente.push(cliente.correo)
                valueCliente.push(cliente.estado_civil)
                valueCliente.push(cliente.direccion)
                valueCliente.push(conyuge_id)
                valueCliente.push(vendedor_id)

                if (rsSearchCliente.rows.length === 0) {
                    // CREACION DE CLIENTE
                    const responseCliente = await pool.query(scriptCreateCliente, valueCliente)
    
                    if (responseCliente.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al crear cliente" })
                    }
                }
    
                if (rsSearchCliente.rows.length === 1) {
                    // ACTUALIZACION DE CLIENTE
                    valueCliente.push(cliente.dni)
                    valueCliente.splice(0, 1)
                    const responseCliente = await pool.query(scriptUpdateCliente, valueCliente)
    
                    if (responseCliente.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al actualizar cliente" })
                    }
                }

                cliente_id = cliente.dni
            } else {
                res.status(400).json({ "error": "Ocurrio un error al buscar cliente" })
            }
            
        } else {
            res.status(400).json({ "error": "El cliente no puede ser vacio" })
        }

        //FINANCIAMIENTO
        if (financiamiento !== null && financiamiento !== undefined) {
            //BUSCAMOS CLIENTE EN BASE DE DATOS
            valueFinanciamiento.push(puesto_id + '_F') //VALUE 1
            const rsSearchFinanciamiento = await pool.query(scriptSearchFinanciamiento, valueFinanciamiento)

            if (rsSearchFinanciamiento.rows.length === 0 || rsSearchFinanciamiento.rows.length === 1) {
                //INICIAMOS VALORES FINANCIAMIENTO
                valueFinanciamiento.push(financiamiento.imp_separacion)
                valueFinanciamiento.push(financiamiento.saldo_inicial)
                valueFinanciamiento.push(financiamiento.financiamiento)
                valueFinanciamiento.push(financiamiento.fecha_separacion)
                valueFinanciamiento.push(financiamiento.fecha_saldo_inicial)
                valueFinanciamiento.push(financiamiento.fecha_financiamiento)

                if (rsSearchFinanciamiento.rows.length === 0) {
                    // CREACION DE CLIENTE
                    const responseFinanciamiento = await pool.query(scriptCreateFinanciamiento, valueFinanciamiento)
    
                    if (responseFinanciamiento.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al crear financiamiento" })
                    }
                }
    
                if (rsSearchFinanciamiento.rows.length === 1) {
                    // ACTUALIZACION DE CLIENTE
                    valueFinanciamiento.push(puesto_id + '_F') //VALUE 8
                    valueFinanciamiento.splice(0, 1)
                    const responseFinanciamiento = await pool.query(scriptUpdateFinanciamiento, valueFinanciamiento)
    
                    if (responseFinanciamiento.rowCount !== 1) {
                        res.status(400).json({ "error": "Ocurrio un error al actualizar financiamiento" })
                    }
                }
            } else {
                res.status(400).json({ "error": "Ocurrio un error al buscar financiamiento" })
            }
        } else {
            res.status(400).json({ "error": "El financiamiento no puede ser vacio" })
        }

        valuePuesto.push(puesto.nro_local)
        valuePuesto.push(puesto.ancho)
        valuePuesto.push(puesto.largo)
        valuePuesto.push(puesto.previo_venta)
        valuePuesto.push(puesto.estado)
        valuePuesto.push(cliente_id)
        valuePuesto.push(puesto_id + '_F')
        valuePuesto.push(comentario)
        valuePuesto.push(puesto_id)
        valuePuesto.splice(0, 1)
        const responsePuestoUpdate = await pool.query(scriptUpdatePuesto, valuePuesto)

        if (responsePuestoUpdate.rowCount !== 1) {
            res.status(400).json({ "error": "Ocurrio un error al actualizar puesto" })
        } else {
            res.status(200).json(responsePuestoUpdate.rowCount)
        }
    } else {
        res.status(400).json({ "error": "El puesto no puede ser vacio" })
    }
}

module.exports = {
    getPuestos,
    getDataPuesto,
    createDataPuesto
}