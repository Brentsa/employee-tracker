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
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Update an employee manager", "Delete an employee", "Exit"]
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
                return this.promptAddRole();
            
            case "Add an employee":
                return this.promptAddEmployee();
            
            case "Update an employee role":
                return this.promptUpdateEmployeeRole();

            case "Update an employee manager":
                return this.promptUpdateEmployeeManager();

            case "Delete an employee":
                return this.promptDeleteEmployee();
    
            case "Exit":
                //Terminate connection and exit the app.
                console.log("\nThanks and take care!");
                this.db.end();
                break;
        }
    }

    //Present user with a formatted table showing department names and department ids
    displayAllDepartments()
    {
        const sql = "SELECT * FROM departments ORDER BY id";
        
        this.db.promise().query(sql)
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

    //Present user with the job title, role id, the department that role belongs to, and the salary for that role
    displayAllRoles()
    {
        const sql =`SELECT roles.id, roles.title, roles.salary, departments.name AS department
                    FROM roles
                    JOIN departments ON roles.department_id = departments.id
                    ORDER BY roles.id`;
                
        this.db.promise().query(sql)
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

    //Present user with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
    displayAllEmployees()
    {
        const sql =`SELECT A.id, CONCAT(A.first_name,' ', A.last_name) AS name, roles.title, roles.salary, departments.name AS department, COALESCE(CONCAT(B.first_name, ' ', B.last_name), '') AS manager
                    FROM employees A
                    JOIN roles ON A.role_id = roles.id
                    JOIN departments ON roles.department_id = departments.id
                    LEFT JOIN employees B ON A.manager_id = B.id
                    ORDER BY A.id`;

        this.db.promise().query(sql)
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

    //Prompt user to enter the name of the department and that department is added to the database
    promptAddDepartment()
    {
        //Prompt the user for the department name
        inquirer.prompt({
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
            //Create the SQL and param array for the database query
            const sql = "INSERT INTO departments (name) VALUES (?)";
            const param = [answer.departmentName];

            //Query the SQL and param
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

    //Prompt user to enter the employee’s first name, last name, role, and manager and that employee is added to the database
    promptAddEmployee()
    {
        //Create an array of choices for the role names and manager names
        const rolesSql = 'SELECT id, title FROM roles';
        const managerSql = 'SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL';
        let rolesArray = [];
        let managersArray = [];

        this.db.promise().query(rolesSql)
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept roles as a choice
            rolesArray = rows.map(role => {
                //return an object with name and value to provide the id for later use
                return {name: role.title, value: role.id};
            });

            return this.db.promise().query(managerSql);
        })
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept roles as a choice
            managersArray = rows.map(manager => {
                //return an object with name and value to provide the id for later use
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
            //Create the SQL and param array for the database query
            let sql;
            let params;

            //If the user selects 'no manager' we use a query that omits that field value
            if(!manager){
                sql = "INSERT INTO employees (first_name, last_name, role_id) VALUES(?,?,?)";
                params = [firstName, lastName, role];
            }
            else{
                sql = "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES(?,?,?,?)";
                params = [firstName, lastName, role, manager];
            }

            //Run the SQL query and alert the user on success or fail, then rerun the appliation loop
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

    //Prompt user to select an employee to update and their new role and this information is updated in the database
    promptUpdateEmployeeRole()
    {
        //Create an array of choices for the role names and employee names
        const rolesSql = 'SELECT id, title FROM roles';
        const employeesSql = 'SELECT id, first_name, last_name FROM employees' 
        let rolesArray = [];
        let employeesArray = [];

        this.db.promise().query(rolesSql)
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept roles as a choice
            rolesArray = rows.map(role => {
                //return an object with name and value to provide the id for later use
                return {name: role.title, value: role.id};
            });

            return this.db.promise().query(employeesSql)
        })
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept employees as a choice
            employeesArray = rows.map(employee => {
                //return an object with name and value to provide the id for later use
                return {name: employee.first_name + " " + employee.last_name, value: employee.id};
            });
            
            //Once the arrays are set with the correct data, begin to prompt the user
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
            //Create the SQL and param array for the database query
            const sql = "UPDATE employees SET role_id = ? WHERE id = ?";
            const params = [role, employee];

            //Run the SQL query and alert the user on success or fail, then rerun the appliation loop
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

    //Prompt user to select an employee to update and their new manager and this information is updated in the database
    promptUpdateEmployeeManager()
    {
        //Create an array of choices for the manager names and employee names
        const managersSql = 'SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL';
        const employeesSql = 'SELECT id, first_name, last_name FROM employees' 
        let managersArray = [];
        let employeesArray = [];

        this.db.promise().query(managersSql)
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept managers as a choice
            managersArray = rows.map(manager => {
                //return an object with name and value to provide the id for later use
                return {name: manager.first_name + " " + manager.last_name, value: manager.id};
            });

            return this.db.promise().query(employeesSql)
        })
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept employees as a choice
            employeesArray = rows.map(employee => {
                //return an object with name and value to provide the id for later use
                return {name: employee.first_name + " " + employee.last_name, value: employee.id};
            });
            
            //Once the arrays are set with the correct data, begin to prompt the user
            return inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Select an employee:",
                    choices: employeesArray
                },
                {
                    type: "list",
                    name: "manager",
                    message: "Select a manager to assign:",
                    choices: managersArray
                }
            ]);
        })
        .then(({employee, manager}) => {
            //Create the SQL and param array for the database query
            const sql = "UPDATE employees SET manager_id = ? WHERE id = ?";
            const params = [manager, employee];

            //Run the SQL query and alert the user on success or fail, then rerun the appliation loop
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

    //Prompt user to enter the name, salary, and department for the role and that role is added to the database
    promptAddRole()
    {
        //Create the SQL string for the query to acquire an array of departments
        const sql = `SELECT * FROM departments`

        this.db.promise().query(sql)
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept departments as a choice
            const departments = rows.map(department => {
                //return an object with name and value to provide the id for later use
                return {name: department.name, value: department.id}
            })

            return inquirer.prompt([
                {
                    type: "input",
                    name: "name",
                    message: "Enter the name of the new role:"
                },
                {
                    type: "number",
                    name: "salary",
                    message: "Prescribe a salary to the role:"
                },
                {
                    type: "list",
                    name: "department",
                    message: "Select a role to assign:",
                    choices: departments
                }
            ]);
        })
        .then(({name, salary, department}) => {
            //Create the SQL and param array for the database insert query
            const sql = "INSERT INTO roles (title, salary, department_id) VALUES (?,?,?)";
            const param = [name, salary, department];

            //Run the SQL query and alert the user on success or fail, then rerun the appliation loop
            return this.db.promise().query(sql, param);
        })
        .then(result => {
            console.log("\nRole added successfully\n");
            this.runApplication();
        })
        .catch( err => {
            //catch the error, display the error message and restart the loop
            console.log(`\nError: ${err.message}\n`);
            this.runApplication();
        });
    }

    //Prompt the user to delete an employee
    promptDeleteEmployee(){
        //Create an array of choices for the role names and employee names
        const employeesSql = 'SELECT id, first_name, last_name FROM employees' 
        let employeesArray = [];

        this.db.promise().query(employeesSql)
        .then(([rows]) => {
            //Map the SQL rows to a new array so that inquirier can accept employees as a choice
            employeesArray = rows.map(employee => {
                //return an object with name and value to provide the id for later use
                return {name: employee.first_name + " " + employee.last_name, value: employee.id};
            });
            
            //Once the arrays are set with the correct data, begin to prompt the user
            return inquirer.prompt([
                {
                    type: "list",
                    name: "employee",
                    message: "Select an employee to delete from database:",
                    choices: employeesArray
                }
            ]);
        })
        .then(({employee}) => {
            //Create the SQL and param array for the database delete query
            const sql = "DELETE FROM employees WHERE id = ?";
            const params = [employee];

            //Run the SQL query and alert the user on success or fail, then rerun the appliation loop
            this.db.query(sql, params, (err, rows) => {
                if(err){
                    console.log(err);
                    this.runApplication();
                }
                else{
                    console.log('\nEmployee deleted\n');
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
}

module.exports = Application;