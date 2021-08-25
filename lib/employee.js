const mysql = require('./sql');

class Employee {
    constructor(firstName, lastName, role, manager) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.manager = manager;
    }

    insertEmployee() {
        return mysql.db.promise().query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [this.firstName, this.lastName, this.role, this.manager]);
    };

    static updateEmployee(employeeID, roleID) {
        return mysql.db.promise().query(
            `UPDATE employee
            SET role_id = ${roleID}
            WHERE id = ${employeeID}`
        )
    }

    static viewEmployee() {
        return mysql.db.promise().query(
            `SELECT      
            employee.id AS ID,
            employee.first_name AS FirstName, 
            employee.last_name AS LastName, 
            role.title AS Role, 
            role.salary AS Salary, 
            department.name AS Department,
            CONCAT(manager.first_name, ' ', manager.last_name) AS Manager
            FROM employee
            LEFT OUTER JOIN employee manager
            ON employee.manager_id = manager.id
            INNER JOIN role ON employee.role_id = role.id
            INNER JOIN department ON role.department_id=department.id;`
        )
    }
}

module.exports = Employee;