const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        port: 3306,
        password: '1234567890',
        database: 'employee_db'
    });

db.connect(err => {
    if (err) throw err;
    start();
});

function start() {
    inquirer.prompt({
        name: "option",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Quit"
        ]
    }).then((answer) => {
        switch (answer.option) {
            case "View All Employees":
                viewEmployees();
                break;

            case "Add Employee":
                addEmployees();
                break;

            case "Update Employee Role":
                updateRole();
                break;

            case "View All Roles":
                viewRoles();
                break;

            case "Add Role":
                addRole();
                break;

            case "View All Departments":
                viewDepartments();
                break;

            case "Add Department":
                addDepartment();
                break;

            default:
                db.end();
                break;
        }
    });
}

const viewEmployees = () => {
    const sql = `
        SELECT 
            employee.id, 
            employee.first_name, 
            employee.last_name, 
            role.title,
            department.name AS department,
            role.salary,
            CONCAT (manager.first_name, " ", manager.last_name) AS manager
        FROM employee 
        JOIN role 
        ON employee.role_id = role.id
        JOIN department 
        ON role.department_id = department.id
        LEFT JOIN employee AS manager
        ON employee.manager_id = manager.id
        ORDER BY employee.id
        `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
        })
        .catch(console.log)
        .then(() => start());
}

const addEmployees = () => {
    const roles = {}

    const sqlRoles = `
    SELECT id, title
    FROM role
    `;

    db.promise().query(sqlRoles)
        .then(([rows, fields]) => {
            for (i in rows) {
                roles[rows[i].title] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {
            const employees = {}

            const sqlEmployee = `
                SELECT id, CONCAT (employee.first_name, " ", employee.last_name) AS name
                FROM employee
                `;

            db.promise().query(sqlEmployee)
                .then(([rows, fields]) => {
                    for (i in rows) {
                        employees[rows[i].name] = rows[i].id;
                    }
                })
                .catch(console.log)
                .then(() => {
                    const employeeQuestions = [
                        {
                            type: "input",
                            message: "What is the employee's first name?",
                            name: "first",
                            validate: (value) => {
                                if (value) {
                                    return true;
                                } else {
                                    return ("Please enter the first name.");
                                }
                            }
                        },
                        {
                            type: "input",
                            message: "What is the employee's last name?",
                            name: "last",
                            validate: (value) => {
                                if (value) {
                                    return true;
                                } else {
                                    return ("Please enter the last name.");
                                }
                            }
                        },
                        {
                            type: "list",
                            message: "What is the employee's role?",
                            name: "role",
                            choices: Object.keys(roles)
                        },
                        {
                            type: "list",
                            message: "Who is the employee's manager?",
                            name: "manager",
                            choices: Object.keys(employees)
                        }
                    ]

                    inquirer
                        .prompt(employeeQuestions)
                        .then((data) => {
                            const roleId = roles[data.role];
                            const managerId = employees[data.manager];
                            const sql = `
                            INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES ('${data.first}', '${data.last}', '${roleId}', '${managerId}')
                            `;

                            db.promise().query(sql)
                                .then(() => start());
                        });
                });
        });
}

const updateRole = () => {
    const employees = {}

    const sqlEmployee = `
        SELECT id, CONCAT (employee.first_name, " ", employee.last_name) AS name
        FROM employee
        `;
    db.promise().query(sqlEmployee)
        .then(([rows, fields]) => {
            for (i in rows) {
                employees[rows[i].name] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {
            const roles = {}

            const sqlRoles = `
                SELECT id, title
                FROM role
                `;

            db.promise().query(sqlRoles)
                .then(([rows, fields]) => {
                    for (i in rows) {
                        roles[rows[i].title] = rows[i].id;
                    }
                })
                .catch(console.log)
                .then(() => {
                    const updateEmployeeQuestion = [
                        {
                            type: "list",
                            message: "Which employee's role do you want to update?",
                            name: "employee",
                            choices: Object.keys(employees)
                        },
                        {
                            type: "list",
                            message: "Which role do you wnat to assign the selected employee?",
                            name: "role",
                            choices: Object.keys(roles)
                        }
                    ]

                    inquirer
                        .prompt(updateEmployeeQuestion)
                        .then((data) => {
                            const employeeId = employees[data.employee];
                            const roleId = roles[data.role];
                            const sql = `
                                UPDATE employee
                                SET role_id = ${roleId}
                                WHERE id = ${employeeId}
                                `;

                            db.promise().query(sql)
                                .then(() => start());
                        });
                })
        });
}

const viewRoles = () => {
    const sql = `
        SELECT 
            role.id,
            role.title,
            department.name AS department,
            role.salary
        FROM role
        JOIN department
        ON role.department_id = department.id
        ORDER BY role.id
        `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
        })
        .catch(console.log)
        .then(() => start());
}

const addRole = () => {
    const departments = {}

    const sql = `
    SELECT id, name
    FROM department
    `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            for (i in rows) {
                departments[rows[i].name] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {
            const roleQuestions = [
                {
                    type: "input",
                    message: "What is the name of the role?",
                    name: "title",
                    validate: (value) => {
                        if (value) {
                            return true;
                        } else {
                            return ("Please enter a new role.");
                        }
                    }
                },
                {
                    type: "number",
                    message: "What is the salary of the role?",
                    name: "salary",
                    validate: (value) => {
                        if (value && !isNaN(value)) {
                          return true;
                        } else {
                          return "Please enter a salary number.";
                        }
                      }
                },
                {
                    type: "list",
                    message: "Which department does the role belong to?",
                    name: "department",
                    choices: Object.keys(departments)
                }
            ]

            inquirer
                .prompt(roleQuestions)
                .then((data) => {
                    const departmentId = departments[data.department];
                    const sql = `
                    INSERT INTO role (title, salary, department_id)
                    VALUES ('${data.title}', '${data.salary}', '${departmentId}')
                    `;

                    db.promise().query(sql)
                        .then(() => start());
                });
        });
}

const viewDepartments = () => {
    const sql = `
        SELECT id, name
        FROM department
        ORDER BY id
        `;

    db.promise().query(sql)
        .then(([rows, fields]) => {
            console.table(rows);
        })
        .catch(console.log)
        .then(() => start());
}

const addDepartment = () => {
    const departmentQuestion = [
        {
            type: "input",
            message: "What is the name of the department?",
            name: "name",
            validate: (value) => {
                if (value) {
                    return true;
                } else {
                    return ("Please enter a new department name.");
                }
            }
        }
    ]

    inquirer
        .prompt(departmentQuestion)
        .then((data) => {
            const sql = `
            INSERT INTO department (name)
            VALUES (?)
            `;

            db.promise().query(sql, data.name)
                .then(() => start());
        });
}