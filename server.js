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