const { Router } = require("express");
const { getUsuarios, getDataUsuario, createUsuario, 
    stateUsuario, updateUsuario, getDataUsuarioRol } = require("../controllers/usuario.controller");
const { validarJWT } = require("../helpers/validar-jwt");
const router = Router()

router.get('/usuario',[validarJWT], getUsuarios)
//router.get('/usuario/:id',[validarJWT], getDataUsuario)
//router.get('/usuario/by/rol',[validarJWT], getDataUsuarioRol)
router.post('/usuario', [validarJWT], createUsuario)
router.post('/usuario/actualizar',[validarJWT], updateUsuario)
router.post('/usuario/estado',[validarJWT], stateUsuario)

module.exports = router;