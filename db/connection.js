const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config()

//NOTE =====================
//Create a .env file in the root directory and assign DB_HOST, DB_USER, and DB_PASS

// class hrDatabase{
//     constructor(){
//         const db = mysql.createConnection(
//             {
//                 host: process.env.DB_HOST,
//                 user: process.env.DB_USER,
//                 password: process.env.DB_PASS,
//                 database: 'human_resources'
//             }
//         );
//     }

//     viewAllDepartments(){
//         return this.db.promise().query("SELECT * FROM departments")
//         .then( ([rows, fields]) => {
//             console.log(rows);
//         })
//         .catch(console.log("Error"))
//         .then( () => this.db.end());
//     }
// }

// module.exports = hrDatabase;

const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'human_resources'
    }
);

function displayResults(selection){

    switch(selection){
        case "View all departments":
            console.log(1);
            break;

        case "View all roles":
            console.log(2);
            break;
        
        case "View all employees":
            console.log(3);
            break;

        case "Add a department":
            console.log(4);
            break;
        
        case "Add a role":
            console.log(5);
            break;
        
        case "Add an employee":
            console.log(6);
            break;
        
        case "Update an employee role":
            console.log(7);
            break;

        case "Exit":
            console.log("Not ready.");
            db.end();
            break;
    }
}

module.exports = {db, displayResults};