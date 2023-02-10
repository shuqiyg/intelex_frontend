const express = require("express");
const app = express();
const mysql = require('mysql');
var cors = require('cors');

app.use(cors())

const pool = mysql.createPool({
    host : 'mysql8',
    user: 'mysql8user',
    password: 'pa$$w0rd',
    database: 'lms'
})

const pool1 = mysql.createPool({
    host : 'mysql',
    user: 'root',
    password: 'root',
    database: 'innovat_amfsugar'
})

const pool2 = mysql.createPool({

})


app.get("/", (req, res)=>{
    pool.getConnection((err, connection) => {
        if(err) throw err;
        console.log("connected as ID " + connection.threadId);
        connection.query(`SELECT u.firstname, u.lastname,u.email,l.startdate,l.enddate,l.cause,l.startdatetype,l.enddatetype
        FROM users u JOIN leaves l
        ON u.id=l.employee
        WHERE u.active = '1' and l.status = '3' LIMIT 10
        `, (err, rows) => {
            connection.release();
            if(err) throw err;
            console.log(rows);
            res.send(rows);
        });
        
    });
});

app.get("/users", (req, res) => {
    pool1.getConnection((err, connection) => {
        if(err) throw err;
        console.log("connected as ID " + connection.threadId);
        connection.query(`SELECT u.first_name, u.last_name, u.title,
        TRIM(substring(u.phone_work,15)) as ext, CONCAT('(', u.department, ')') as department, ea.email_address 
        FROM users u
        LEFT JOIN email_addr_bean_rel eabr ON u.id=eabr.bean_id
        LEFT JOIN email_addresses ea ON ea.id=eabr.email_address_id
        WHERE eabr.deleted='0' AND u.employee_status='Active' AND (u.phone_work is not null AND length(phone_work) > '14')
        ORDER BY u.first_name`, (err, rows) => {
            connection.release();
            if(err) throw err;
            console.log(rows);
            res.send(rows)
        })
    })
})
//querying data
// function queryUsers(){
//     let users = null;
//     pool1.getConnection((err, connection) => {
//         if(err) throw err;
//         console.log("connected as ID " + connection.threadId);
//         connection.query(`SELECT u.first_name, u.last_name, u.title,
//         TRIM(substring(u.phone_work,15)) as ext, CONCAT('(', u.department, ')') as department, ea.email_address 
//         FROM users u
//         LEFT JOIN email_addr_bean_rel eabr ON u.id=eabr.bean_id
//         LEFT JOIN email_addresses ea ON ea.id=eabr.email_address_id
//         WHERE eabr.deleted='0' AND u.employee_status='Active' AND (u.phone_work is not null AND length(phone_work) > '14')
//         ORDER BY u.first_name`, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             console.log(rows);
//             users = rows;
//         })
//     })
//     return users;
// }

//quering leaves

app.get("/leaveReport", (req, res) => {
    pool.getConnection((err, connection) => {
        
        if(err) throw err;
        console.log("connected as ID " + connection.threadId);
        const date = new Date();
        const dd = date.getDate();
        const mm = date.getMonth() + 1;
        const yyyy = date.getFullYear();
        let today ="";
        if(dd<10 && mm<10){
          today  = yyyy.toString() + "0" + mm.toString()+"0" + dd.toString();
        }
        else if(mm<10){
            today  = yyyy.toString() +"0" + mm.toString()+ dd.toString();
        }else if(dd<10){
            today  = yyyy.toString() + mm.toString()+ "0" + dd.toString();
        }
        else{
            today = yyyy.toString()+mm.toString()+dd.toString();
        }

        console.log(today);
        connection.query(`SELECT u.firstname, u.lastname,u.email,l.startdate,l.enddate,l.cause,l.startdatetype,l.enddatetype
        FROM users u JOIN leaves l
        ON u.id=l.employee
        WHERE u.active = '1' and l.status = '3' and ((l.startdate=${today}) or (l.startdate < ${today} and l.enddate >= ${today}))`, (err, rows) => {
            connection.release();
            if(err) throw err;
            console.log(rows);
            res.send(rows);
        })
    })
})
// function queryLeaves(){
//     let leaves = {};
//     pool.getConnection((err, connection) => {
        
//         if(err) throw err;
//         console.log("connected as ID " + connection.threadId);
//         const date = new Date();
//         const dd = date.getDate();
//         const mm = date.getMonth() + 1;
//         const yyyy = date.getFullYear();
//         console.log(typeof(dd))
//         console.log(yyyy.toString()+mm.toString()+dd.toString());
//         const today = yyyy.toString()+mm.toString()+dd.toString();
//         connection.query(`SELECT u.firstname, u.lastname,u.email,l.startdate,l.enddate,l.cause,l.startdatetype,l.enddatetype
//         FROM users u JOIN leaves l
//         ON u.id=l.employee
//         WHERE u.active = '1' and l.status = '3' and l.startdate=${today}`, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             console.log(rows);
//             leaves = rows;
//         })
//     })
//     return leaves;
// }

app.listen(3001, ()=>{
    console.log('Server is running at port 3001')
})