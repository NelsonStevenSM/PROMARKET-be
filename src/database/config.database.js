//const { Pool } = require("pg")

const { Pool } = require("pg")
//const connectionString = 'postgresql://postgres:admin@localhost:5432/promarket'
const connectionString = 'postgresql://postgres:dtDcA7VPg2dWcscD@sis-promarket.cyvijuifw4lu.us-east-1.rds.amazonaws.com:5432/promarket'

const pool = new Pool({
    connectionString
})

module.exports = {
    pool
}