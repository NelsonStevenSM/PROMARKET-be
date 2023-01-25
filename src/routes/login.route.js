const { Router } = require("express");
const { getToken } = require("../controllers/login.controller");
const router = Router()

router.post('/authentication', getToken)

module.exports = router;