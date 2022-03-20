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
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "Add Employee",
            "Update Employee role",
            "View All Roles",
            "Add Role",
            "View All Departments",
            "Add Department",
            "Exit"
        ]
    }).then((answer) => {
        switch (answer.action) {
            case "View all employees":
                break;

            case "Add an employee":
                break;

            case "Update employee role":
                break;

            case "View all roles":
                break;

            case "Add a role":
                break;

            case "View all departments":
                break;

            case "Add a department":
                break;

            case "Exit":
                db.end();
                break;
        }
    });
}