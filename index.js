let express = require("express");
let mysql = require('mysql')
let pool = require('./database/database').pool;

let app = express()

app.use(express.json());

app.post("/register", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let college = req.body.college;

    let events = req.body.events;

    let sql = mysql.format("INSERT INTO participants(name, college, phone, email, registerTime) VALUES (?, ?, ?, ?, NOW())", [name, college, `+91${phone}`, email]);

    pool.query(sql, (err, rows) => {
        if(err) throw err;

        let id = rows.insertId;
        
        let data = [];
        for (let i = 0; i < events.length; i++){
            data.push([id, events[i]])
        }

        let sql = mysql.format("INSERT INTO event_registered VALUES ?", [data]);
        console.log(sql);
        pool.query(sql, (err, rows) => {
            if(err) throw err;
            let response = {
                "success": true
            }
            res.json(response);
        });
    });
});

app.listen(8000, () => {
    console.log("Server is listening");
})