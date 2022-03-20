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
                break;

            case "View All Roles":
                break;

            case "Add Role":
                break;

            case "View All Departments":
                break;

            case "Add Department":
                break;

            case "Exit":
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
                            name: "first"
                        },
                        {
                            type: "input",
                            message: "What is the employee's last name?",
                            name: "last"
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
                                .then(([rows, fields]) => {
                                    console.log(`Added ${data.first} ${data.last} to the database.`);
                                })
                                .catch(console.log)
                                .then(() => start());
                        });
                });
        });
}

