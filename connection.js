const {Client} = require('pg');

const client = new Client({
    host: "localhost",
    user: "Lyna",
    post: 5432,
    password: "LynaPWD",
    database: "ForeSight_db"
})

module.exports = client

// client.connect();

// client.query(`Select * from "Assure"`,(err, res)=>{
//     if(!err){
//         console.log(res.rows);
//     }
//     else{
//         console.log(err.message);
//     }
//     client.end;
// })