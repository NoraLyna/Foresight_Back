const { Pool, Client } = require('pg')
//require('variables').config();

/*const pool = new Pool({
  user: 'openpg',
  host: 'localhost',
  database: 'proj2cs',
  password: 'openpgpwd',
  port: 5432,
})*/

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
})

/*const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
const pool = new Pool({
  connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
});*/

module.exports = {
    pool,
}

