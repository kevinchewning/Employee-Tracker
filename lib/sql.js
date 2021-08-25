const mysql = require('mysql2');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'UxxUWn73e!VU.E9',
      database: 'employee_tracker_db'
    },
    console.log(`Connected to the employee_tracker_db database.`)
);

exports.db = db