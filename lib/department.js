const mysql = require('./sql');

class Department {
    constructor(name) {
        this.name = name;
    }

    insertDept() {        
        return mysql.db.promise().query('INSERT INTO department (name) VALUES (?)', this.name);
    };

    static viewDept() {
        return mysql.db.promise().query('SELECT id AS ID, name AS Department FROM department');
    }
}

module.exports = Department;