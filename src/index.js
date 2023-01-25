const express = require('express')
const cors = require("cors")
const app = express()

//SE DEFINEN MIDDLEWARES
app.use(cors())
app.use(express.json())
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))

//SE DEFINEN RUTAS
app.use(require('./routes/usuario.route'))
app.use(require('./routes/login.route'))
app.use(require('./routes/puesto.route'))
app.use(require('./routes/reporte.route'))

app.listen(4100);
console.log("Servidor en 4100")