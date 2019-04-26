const mysql = require('mysql');
const fs = require('fs')

const data = fs.readFileSync(__dirname+"/../config/database.json");
let cred = JSON.parse(data)

const pool = mysql.createPool({
    connectionLimit : 100,
    host : cred.host,
    user : cred.user,
    password : cred.password,
    database : cred.database
});

exports.pool = pool;