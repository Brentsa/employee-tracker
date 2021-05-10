const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
require('dotenv').config()

class Application{
    constructor()
    {
        //Set up the db connection when an application is instantiated
        this.db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: 'human_resources' });

        //The main menu question that will first be presented to the user via inquirer
        this.mainMenuQuestion = {
            type: "list",
            name: "selection",
            message: "What would you like to do?",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
        };
    }

    //execute this function to begin the app and start the interation loop
    runApplication()
    {
        //run inquirer
        inquirer
        .prompt(this.mainMenuQuestion)
        .then(({selection}) => {
            this.displayResults(selection);
        });
    }

    //Handle the results from the user selection
    displayResults(selection)
    {
        //Determine what the app should do based on the respose from inquirer
        switch(selection){
            case "View all departments":
                return this.displayAllDepartments();
    
            case "View all roles":
                return this.displayAllRoles();
            
            case "View all employees":
                return this.displayAllEmployees();
    
            case "Add a department":
                console.log(4);
                this.runApplication();
                break;
            
            case "Add a role":
                console.log(5);
                this.runApplication();
                break;
            
            case "Add an employee":
                console.log(6);
                this.runApplication();
                break;
            
            case "Update an employee role":
                console.log(7);
                this.runApplication();
                break;
    
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
        const sql = "SELECT * FROM employees";

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

    //WHEN I choose to add an employee
    //THEN I am prompted to enter the employee’s first name, last name, role, and manager and that employee is added to the database

    //WHEN I choose to update an employee role
    //THEN I am prompted to select an employee to update and their new role and this information is updated in the database 

    // WHEN I choose to add a role
    // THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
}

module.exports = Application;