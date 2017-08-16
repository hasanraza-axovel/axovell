var mysql = require('mysql');
var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'Axovel',
    port : 3306,
});

// console.log(connection);
module.exports = connection;
