const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
require('dotenv').config()

class Application{
    constructor()
    {
        //Set up the db connection when an application is instantiated
        this.db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: 'human_resources' });
    }

    //execute this function to begin the app and start the interation loop
    runApplication()
    {
        //run inquirer
        inquirer
        .prompt({
            type: "list",
            name: "selection",
            message: "What would you like to do?",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
        })
        .then(({selection}) => {
            this.displayResults(selection);
        });
    }

    //Handle the results from the user selection
    displayResults(selection)
    {
        //Determine what the app should do based on the respose from inquirer
        //Returns a promise for modularity unless exiting at which point we'll terminate the db connection and end the app
        switch(selection){
            case "View all departments":
                return this.displayAllDepartments();
    
            case "View all roles":
                return this.displayAllRoles();
            
            case "View all employees":
                return this.displayAllEmployees();
    
            case "Add a department":
                return this.promptAddDepartment();
                
            case "Add a role":
                console.log(5);
                this.runApplication();
                break;
            
            case "Add an employee":
                return this.promptAddEmployee();
            
            case "Update an employee role":
                return this.updateEmployeeRole();
    
            case "Exit":
                console.log("\nThanks and take care!");
                this.db.end();
                break;
        }
    }

    //WHEN I choose to view all departments
    //THEN I am presented with a formatted table showing department names and department ids
    //Returns a promise that displays all departments in a table
    displayAllDepartments(){
        const sql = "SELECT * FROM departments";
                
        return this.db.promise().query(sql)
        .then( ([rows]) => {

            //log a line break and then a table with data
            console.log("");
            console.table(rows);

            //rerun the main application loop
            this.runApplication();
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //WHEN I choose to view all roles
    //THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
    //Returns a promise that displays all roles in a table
    displayAllRoles(){
        const sql = "SELECT * FROM roles";
                
        return this.db.promise().query(sql)
        .then( ([rows]) => {

            //log a line break and then a table with data
            console.log("");
            console.table(rows);

            //rerun the main application loop
            this.runApplication();
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //WHEN I choose to view all employees
    //THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
    //Returns a promise that displays all employees in a table
    displayAllEmployees(){
        const sql =`SELECT A.id, CONCAT(A.first_name,' ', A.last_name) AS name, roles.title, roles.salary, departments.name AS department, COALESCE(CONCAT(B.first_name, ' ', B.last_name), '') AS manager
                    FROM employees A
                    JOIN roles ON A.role_id = roles.id
                    JOIN departments ON roles.department_id = departments.id
                    LEFT JOIN employees B ON A.manager_id = B.id
                    ORDER BY A.id`;

        return this.db.promise().query(sql)
        .then( ([rows]) => {

            //log a line break and then a table with data
            console.log("");
            console.table(rows);

            //rerun the main application loop
            this.runApplication();
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //WHEN I choose to add a department
    //THEN I am prompted to enter the name of the department and that department is added to the database
    promptAddDepartment(){
        return inquirer.prompt({
            type: "input",
            name: "departmentName",
            message: "Enter a department name:",
            validate: departmentName => {
                if(typeof departmentName == "string" && departmentName.length > 0){
                    return true;
                }
                else{
                    return "Please enter a valid department name.";
                }
            }
           
        })
        .then(answer => {
            const sql = "INSERT INTO departments (name) VALUES (?)";
            const param = [answer.departmentName];

            return this.db.promise().query(sql, param);
        })
        .then(result => {
            console.log("\nDepartment added successfully\n");

            //Run application after the department query
            this.runApplication();
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //WHEN I choose to add an employee
    //THEN I am prompted to enter the employee’s first name, last name, role, and manager and that employee is added to the database
    promptAddEmployee(){
        const rolesSql = 'SELECT id, title FROM roles';
        const managerSql = 'SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL';
        let rolesArray = [];
        let managersArray = [];

        this.db.promise().query(rolesSql)
        .then(([rows]) => {
            rolesArray = rows.map(role => {
                return {name: role.title, value: role.id};
            });

            return this.db.promise().query(managerSql);
        })
        .then(([rows]) => {
            managersArray = rows.map(manager => {
                return {name: manager.first_name + " " + manager.last_name, value: manager.id};
            });

             //Add a no manager option to the list of managers in the event we are adding
             managersArray.push({name: "No Manager", value: 0});
            
            return inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "Enter the employee's first name:"
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Enter the employee's last name:"
                },
                {
                    type: "list",
                    name: "role",
                    message: "Pick a role:",
                    choices: rolesArray
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Pick a manager:",
                    choices: managersArray
                }
            ]);
        })
        .then(({firstName, lastName, role, manager}) => {
            let sql;
            let params;

            if(!manager){
                sql = "INSERT INTO employees (first_name, last_name, role_id) VALUES(?,?,?)";
                params = [firstName, lastName, role];
            }
            else{
                sql = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)";
                params = [firstName, lastName, role, manager];
            }

            this.db.query(sql, params, (err, rows) => {
                if(err){
                    console.log(err);
                    this.runApplication();
                }
                else{
                    console.log('\nEmployee added successfully\n');
                    this.runApplication();
                }
            });
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //WHEN I choose to update an employee role
    //THEN I am prompted to select an employee to update and their new role and this information is updated in the database
    updateEmployeeRole(){
        const rolesSql = 'SELECT id, title FROM roles';
        const employeesSql = 'SELECT id, first_name, last_name FROM employees' 
        let rolesArray = [];
        let employeesArray = [];

        this.db.promise().query(rolesSql)
        .then(([rows]) => {
            rolesArray = rows.map(role => {
                return {name: role.title, value: role.id};
            });

            return this.db.promise().query(employeesSql)
        })
        .then(([rows]) => {
            employeesArray = rows.map(employee => {
                return {name: employee.first_name + " " + employee.last_name, value: employee.id};
            });
            
            return inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Select an employee:",
                    choices: employeesArray
                },
                {
                    type: "list",
                    name: "role",
                    message: "Select a role to assign:",
                    choices: rolesArray
                }
            ]);
        })
        .then(({employee, role}) => {
            const sql = "UPDATE employees SET role_id = ? WHERE id = ?";
            const params = [role, employee];

            this.db.query(sql, params, (err, rows) => {
                if(err){
                    console.log(err);
                    this.runApplication();
                }
                else{
                    console.log('\nEmployee updated successfully\n');
                    this.runApplication();
                }
            });
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    // WHEN I choose to add a role
    // THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
    addNewRole(){

    }
}

module.exports = Application;