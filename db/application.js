const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
require('dotenv').config()

class Application{
    constructor(){
        this.db = mysql.createConnection({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: 'human_resources' });

        this.mainMenuQuestion = {
            type: "list",
            name: "selection",
            message: "What would you like to do?",
            choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
        };
    }

    runApplication()
    {
        inquirer
        .prompt(this.mainMenuQuestion)
        .then(({selection}) => {
            this.displayResults(selection);
        });
    }

    displayResults(selection)
    {
        switch(selection){
            case "View all departments":
                console.log(1);
                this.runApplication();
                break;
    
            case "View all roles":
                console.log(2);
                this.runApplication();
                break;
            
            case "View all employees":
                console.log(3);
                this.runApplication();
                break;
    
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
                console.log("Not ready.");
                this.db.end();
                break;
        }
    }
}

module.exports = Application;