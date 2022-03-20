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
    },
    console.log(`Connected to the employee_db database.`)
);