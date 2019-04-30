let express = require("express");
let mysql = require('mysql')
let pool = require('./database/database').pool;
let cors = require('cors');
let excel = require('exceljs');

let app = express()

app.use(express.json());
app.use(cors());
app.use("/", express.static("public"));


app.post("/register", (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let phone = req.body.phone;
    let college = req.body.college;

    let events = req.body.events;

    let sql = mysql.format("INSERT INTO participants(name, college, phone, email, registerTime) VALUES (?, ?, ?, ?, NOW())", [name, college, `+91${phone}`, email]);

    pool.query(sql, (err, rows) => {
        if (err) throw err;

        let id = rows.insertId;

        let data = [];
        for (let i = 0; i < events.length; i++) {
            data.push([id, events[i]])
        }

        let sql = mysql.format("INSERT INTO event_registered VALUES ?", [data]);
        console.log(sql);
        pool.query(sql, (err, rows) => {
            if (err) throw err;
            let response = {
                "success": true
            }
            res.json(response);
        });
    });
});

app.get("/excel", (req, res) => {
    let sql = mysql.format("select ID, name, college, phone, email, registerTime, eventcode from participants, event_registered where ID = userID");

    pool.query(sql, (err, rows) => {
        if (err) throw err;
        let workbook = new excel.Workbook();

        workbook.creator = "Aslam";
        workbook.lastModifiedBy = "Aslam";
        workbook.created = new Date();

        let sheet = workbook.addWorksheet();

        sheet.columns = [
            { header: "Sl. No", key: "sl" },
            { header: "ID", key: "ID" },
            { header: "Name", key: "name" },
            { header: "College", key: "college" },
            { header: "Phone", key: "phone" },
            { header: "Email", key: "email" },
            { header: "Registration Time", key: "registerTime" },
            { header: "Event Code", key: "eventcode" }
        ]

        sheet.getRow(1).style = { font: { bold: true } };
        let sl = 0;
        rows.map((obj) => {
            obj.sl = ++sl;
            let x = new Date(obj.registerTime)
            obj.registerTime = x.toLocaleString("en-IN")
        });
        sheet.addRows(rows);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'Report.xlsx');
        workbook.xlsx.write(res).then(() => {
            res.end()
        });
    })
})

app.listen(8000, () => {
    console.log("Server is listening");
})