const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

//connecting to the database
const db = mysql.createConnection(
    {
        host: '127.0.0.1',
        user: 'root',
        port: 3306,
        password: '1234567890',
        database: 'employee_db'
    });

//start the function if connection is successful
db.connect(err => {
    if (err) throw err;
    start();
});

//start function
function start() {

    //inquirer to generate questions
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

        //based on the choice chosen go to the function
        switch (answer.option) {
            case "View All Employees":
                viewEmployees();
                break;

            case "Add Employee":
                addEmployee();
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

//function the view all the employees in the databse
const viewEmployees = () => {

    //sql query
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

    //pushing the query 
    db.promise().query(sql)
        .then(([rows, fields]) => {

            //display the table
            console.table(rows);
        })
        .catch(console.log)

        //go back to the start function
        .then(() => start());
}

//function to add an employee
const addEmployee = () => {
    const roles = {}

    //sql query
    const sqlRoles = `
    SELECT id, title
    FROM role
    `;

    //pushing the sql query
    db.promise().query(sqlRoles)
        .then(([rows, fields]) => {
            for (i in rows) {

                //getting the title from the ids
                roles[rows[i].title] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {
            const employees = {}

            //sql query
            const sqlEmployee = `
                SELECT id, CONCAT (employee.first_name, " ", employee.last_name) AS name
                FROM employee
                `;

            //pushing the query
            db.promise().query(sqlEmployee)
                .then(([rows, fields]) => {
                    for (i in rows) {

                        //getting the employee names from their ids
                        employees[rows[i].name] = rows[i].id;
                    }
                })
                .catch(console.log)
                .then(() => {

                    //prompting inquirer
                    const employeeQuestions = [
                        {
                            type: "input",
                            message: "What is the employee's first name?",
                            name: "first",

                            //validation
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

                            //validation
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

                            //adding the data to the database using a sql query
                            const roleId = roles[data.role];
                            const managerId = employees[data.manager];

                            //sql query
                            const sql = `
                            INSERT INTO employee (first_name, last_name, role_id, manager_id)
                            VALUES ('${data.first}', '${data.last}', '${roleId}', '${managerId}')
                            `;

                            //pushing the query
                            db.promise().query(sql)
                                .then(() => start());
                        });
                });
        });
}

const updateRole = () => {
    const employees = {}

    //sql query
    const sqlEmployee = `
        SELECT id, CONCAT (employee.first_name, " ", employee.last_name) AS name
        FROM employee
        `;

    //pushing the query
    db.promise().query(sqlEmployee)
        .then(([rows, fields]) => {
            for (i in rows) {

                //getting the employee names from their ids
                employees[rows[i].name] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {
            const roles = {}

            //sql query
            const sqlRoles = `
                SELECT id, title
                FROM role
                `;

            //pushing the query
            db.promise().query(sqlRoles)
                .then(([rows, fields]) => {

                    //getting the roles names from their ids
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

                            //sql query
                            const sql = `
                                UPDATE employee
                                SET role_id = ${roleId}
                                WHERE id = ${employeeId}
                                `;
                            
                            //pushing the query
                            db.promise().query(sql)
                                .then(() => start());
                        });
                })
        });
}

const viewRoles = () => {
    
    //sql query
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

    //pushing the query
    db.promise().query(sql)
        .then(([rows, fields]) => {

            //displaying the table
            console.table(rows);
        })
        .catch(console.log)
        .then(() => start());
}

//function to add a new role
const addRole = () => {
    const departments = {}

    //sql query
    const sql = `
    SELECT id, name
    FROM department
    `;

    //pushing the query
    db.promise().query(sql)
        .then(([rows, fields]) => {
            for (i in rows) {

                //getting the department names from their ids
                departments[rows[i].name] = rows[i].id;
            }
        })
        .catch(console.log)
        .then(() => {

            //prompting inquirer
            const roleQuestions = [
                {
                    type: "input",
                    message: "What is the name of the role?",
                    name: "title",

                    //validation
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

                    //validation
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

                    //adding the data to the database using a sql query
                    const departmentId = departments[data.department];

                    //sql query
                    const sql = `
                    INSERT INTO role (title, salary, department_id)
                    VALUES ('${data.title}', '${data.salary}', '${departmentId}')
                    `;

                    //pushing the query
                    db.promise().query(sql)
                        .then(() => start());
                });
        });
}

const viewDepartments = () => {

    //sql query
    const sql = `
        SELECT id, name
        FROM department
        ORDER BY id
        `;

    //pushing the query
    db.promise().query(sql)
        .then(([rows, fields]) => {

            //displaying the table
            console.table(rows);
        })
        .catch(console.log)
        .then(() => start());
}

//function to add a department
const addDepartment = () => {

    //prompting inquirer
    const departmentQuestion = [
        {
            type: "input",
            message: "What is the name of the department?",
            name: "name",

            //validation
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
        
        //adding the data to the database using a sql query
        .then((data) => {
            
            //sql query
            const sql = `
            INSERT INTO department (name)
            VALUES (?)
            `;
            
            //pushing the query
            db.promise().query(sql, data.name)
                .then(() => start());
        });
}