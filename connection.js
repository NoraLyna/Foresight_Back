const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'openpg',
  host: 'localhost',
  database: 'proj2cs',
  password: 'openpgpwd',
  port: 5432,
})

module.exports = {
    pool,
}

