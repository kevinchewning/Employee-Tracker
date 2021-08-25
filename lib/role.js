const mysql = require('./sql');

class Role {
    constructor(name, department, salary) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    insertRole() {
        return mysql.db.promise().query('INSERT INTO role (title, department_id, salary) VALUES (?, ?, ?)', [this.name, this.department, this.salary]);
    };

    static viewRole() {
        return mysql.db.promise().query(
            `SELECT 
            role.title AS Role, 
            role.salary AS Salary,
            department.name AS Department
            FROM role 
            INNER JOIN department ON role.department_id=department.id;`
        )
    }
}

module.exports = Role;