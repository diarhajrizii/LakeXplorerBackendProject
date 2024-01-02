const mysql = require("mysql2"); // MYSQL
var dbMain = mysql.createPool({
  host: process.env.MAIN_HOST,
  database: process.env.MAIN_DATABASE,
  user: process.env.MAIN_USERNAME,
  password: process.env.MAIN_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  multipleStatements: true,
});

module.exports = dbMain;
