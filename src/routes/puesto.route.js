const { Router } = require("express");
const { getPuestos, getDataPuesto, createDataPuesto } = require("../controllers/puesto.controller");
const { validarJWT } = require("../helpers/validar-jwt");

const router = Router()

router.get('/puesto', [validarJWT], getPuestos)
router.get('/puesto/:id', [validarJWT], getDataPuesto)
router.post('/puesto', [validarJWT], createDataPuesto)

module.exports = router;