const { Router } = require("express");
const { getPuestos, getDataPuesto, createDataPuesto, reiniciarPuesto } = require("../controllers/puesto.controller");
const { validarJWT } = require("../helpers/validar-jwt");

const router = Router()

router.get('/puesto/nivel/:id', [validarJWT], getPuestos)
router.get('/puesto/:id', [validarJWT], getDataPuesto)
router.post('/puesto', [validarJWT], createDataPuesto)
router.post('/puesto/reiniciar', [validarJWT], reiniciarPuesto)

module.exports = router;