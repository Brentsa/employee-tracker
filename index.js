// GIVEN a command-line application that accepts user input
// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role

//const hrDatabase = require('./db/connection');
const {db, displayResults}= require('./db/connection');
const inquirer = require('inquirer');


var mainMenuQuestions = [
    {
        type: "list",
        name: "selection",
        message: "What would you like to do?",
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
    }
];

inquirer
    .prompt(mainMenuQuestions)
    .then(({selection}) => {

        //return db.promise().query("SELECT * FROM departments")
        
        displayResults(selection);
    })




    // db.query("SELECT * FROM departments", (err, rows)=>{
        //     if(err){
        //         console.log("Error");
        //     }
        //     console.table(rows);
        // });