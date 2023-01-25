const { Router } = require("express");
const { getPuestosVendidos } = require("../controllers/reporte.controller");
const { validarJWT } = require("../helpers/validar-jwt");
const router = Router()

router.get('/reporte',[validarJWT], getPuestosVendidos)

module.exports = router