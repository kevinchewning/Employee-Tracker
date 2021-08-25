let Department = require('./department');
let Role = require('./role');
let Employee = require('./employee');
let inquirer = require("inquirer");
let mysql = require('./sql');
let cTable = require('console.table');

class Query {
    constructor () {
        this.options = ['View All Departments', 'View All Roles', 'View All Employees', 'Add Department', 'Add Role', 'Add Employee', 'Update Employee Role']
    };

    optionsMenu() {
        inquirer.prompt({
            type: 'list',
            message: 'What would you like to do next?',
            choices: this.options,
            name: 'userOption'
        })
        .then((res) => {
            switch(res.userOption) {
                case 'View All Departments':
                    this.viewDept();
                    break;
                case 'View All Roles':
                    this.viewRoles();
                    break;
                case 'View All Employees':
                    this.viewEmp();
                    break;
                case 'Add Department':
                    this.addDept();
                    break;
                case 'Add Role':
                    this.addRole();
                    break;
                case 'Add Employee':
                    this.addEmp();
                    break;
                case 'Update Employee Role':
                    this.updateEmp();
                    break;
            }
        })
    }
    
    async viewDept() {
        let departments = await Department.viewDept()
        console.table(departments[0])
        this.optionsMenu();
    }

    async viewRoles() {
        let roles = await Role.viewRole()
        console.table(roles[0])
        this.optionsMenu();
    }

    async viewEmp() {
        let employees = await Employee.viewEmployee()
        console.table(employees[0])
        this.optionsMenu();
    }

    async addDept() {
        let inquiry = await inquirer.prompt({
            type: 'input',
            message: 'What is the name of the new department?',
            name: 'department'
        })

        let newDept = new Department(inquiry.department);
        newDept.insertDept().then(() => {
            this.optionsMenu();
        });
    }

    async addRole() {
        //Query DB for available departments to tie to the role being added
        let departments = await mysql.db.promise().query('SELECT * FROM department').then((results) => {return results[0]});

        //Map departments into an array for the inquirer question
        let departmentChoice = departments.map(x => x.name)

        //Query DB for roles
        let roleQuery = await mysql.db.promise().query('SELECT * FROM role').then((results) => {return results[0]});

        //Map roles into an array for the inquirer validation
        let roles = roleQuery.map(x => x.title.toLowerCase());
        
        //Inquirer prompts for role information from User
        let inquiry = await inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name of the role you would like to add?',
                name: 'role',
                validate: (input) => {
                    //Check input against existing roles to make sure it is unique
                    let lowercase = input.toLowerCase
                    if (roles.includes(lowercase)) {
                        return 'Role already exists'
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'list',
                message: 'Which department does the role belong to?',
                choices: departmentChoice,
                name: 'department'
            },
            {
                type: 'number',
                message: 'What is the salary of the new role?',
                name: 'salary'
            }
        ])

        //Loop through deparments array to find matching department id
        for(let i = 0; i < departments.length; i++) {
            if (Object.values(departments[i]).includes(inquiry.department)) {
                let newRole = new Role(inquiry.role, departments[i].id, inquiry.salary)
                newRole.insertRole().then(() => {this.optionsMenu()})
            }
        }
    }

    async addEmp() {
        //Query DB for roles
        let roleQuery = await mysql.db.promise().query('SELECT * FROM role').then((results) => {return results[0]});

        //Map roles into an array for the inquirer question
        let roleChoice = roleQuery.map(x => x.title);

        //Query DB for employees
        let employeeQuery = await mysql.db.promise().query('SELECT * FROM employee').then((results) => {return results[0]});

        //Map employees into an array for the inquirer question
        let employeeChoice = employeeQuery.map(x => x.first_name + " " + x.last_name);

        //Add 'None' as an option for employees
        employeeChoice.push('None');

        let inquiry = await inquirer.prompt([
            {
                type: 'input',
                message: "What is the employee's first name?",
                name: 'firstName',
                validate: (input) => {
                    if (!input) {
                        return 'First name cannot be blank.'
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'input',
                message: "What is the employee's last name?",
                name: 'lastName',
                validate: (input) => {
                    if (!input) {
                        return 'Last name cannot be blank.'
                    } else {
                        return true;
                    }
                }
            },
            {
                type: 'list',
                message: "Which role will the employee take?",
                choices: roleChoice,
                name: 'role'
            },
            {
                type: 'list',
                message: "Enter the employee's manager:",
                choices: employeeChoice,
                name: 'manager'
            }
        ])

        //Loop through roles array to find matching role id
        let roleID;
        for(let i = 0; i < roleQuery.length; i++) {
            if (Object.values(roleQuery[i]).includes(inquiry.role)) {
                roleID = roleQuery[i].id
            }
        }

        //Loop through employees array to find matching employee id
        let employeeID = null
        let manager = inquiry.manager.split(' ')
        for(let i = 0; i < employeeQuery.length; i++) {
            let included = manager.every(val => Object.values(employeeQuery[i]).includes(val))
            if (included) {
                employeeID = employeeQuery[i].id
            }
        }

        let newEmployee = new Employee(inquiry.firstName, inquiry.lastName, roleID, employeeID)
        newEmployee.insertEmployee().then(() => {this.optionsMenu()})
    }

    async updateEmp() {
        //Query DB for roles
        let roleQuery = await mysql.db.promise().query('SELECT * FROM role').then((results) => {return results[0]});

        //Map roles into an array for the inquirer question
        let roleChoice = roleQuery.map(x => x.title);

        //Query DB for employees
        let employeeQuery = await mysql.db.promise().query('SELECT * FROM employee').then((results) => {return results[0]});

        //Map employees into an array for the inquirer question
        let employeeChoice = employeeQuery.map(x => x.first_name + " " + x.last_name);

        let inquiry = await inquirer.prompt([
            {
                type: 'list',
                message: 'Which employee would you like to update?',
                choices: employeeChoice,
                name: 'employee'
            },
            {
                type: 'list',
                message: 'Which role would you like the employee to have?',
                choices: roleChoice,
                name: 'role'
            },
        ])

        //Loop through roles array to find matching role id
        let roleID;
        for(let i = 0; i < roleQuery.length; i++) {
            if (Object.values(roleQuery[i]).includes(inquiry.role)) {
                roleID = roleQuery[i].id
            }
        }

        //Loop through employees array to find matching employee id
        let employeeID;
        let employee = inquiry.employee.split(' ')
        for(let i = 0; i < employeeQuery.length; i++) {
            let included = employee.every(val => Object.values(employeeQuery[i]).includes(val))
            if (included) {
                employeeID = employeeQuery[i].id
            }
        }

        Employee.updateEmployee(employeeID, roleID).then(() => {this.optionsMenu()})
    }
}

module.exports = Query;