const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'SEU_HOST',
    user: 'SEU_USER',
    password: 'SUA_SENHA',
    database: 'railway'
});

app.get('/', (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

app.get('/register', (req, res) => {
    const mac = req.query.mac;

    db.query("INSERT IGNORE INTO users (mac) VALUES (?)",[mac]);

    res.json({status:"ok"});
});

app.get('/user', (req, res) => {
    const mac = req.query.mac;

    db.query("SELECT * FROM users WHERE mac=?",[mac], (err, result)=>{
        if(result.length > 0){
            res.json(result[0]);
        }else{
            res.json({status:"not_found"});
        }
    });
});

app.listen(3000, () => console.log("API rodando"));
