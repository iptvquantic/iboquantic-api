const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'hopper.proxy.rlwy.net',
    user: 'root',
    password: 'ttpcqXvFipaxGZIsUzIlPIqhtoJFRCML',
    database: 'railway',
    port: 40792
});

db.connect(err => {
    if (err) {
        console.log("Erro DB:", err);
    } else {
        console.log("Banco conectado 🔥");
    }
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

app.listen(3000, () => console.log("API rodando 🚀"));
db.connect(err => {
    if (err) {
        console.log("Erro DB:", err);
    } else {
        console.log("Banco conectado 🔥");

        db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                mac VARCHAR(50) UNIQUE,
                nome VARCHAR(100),
                usuario VARCHAR(100),
                senha VARCHAR(100),
                dns VARCHAR(255),
                ativo TINYINT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }
});
app.get('/ativar', (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], (err) => {
        if (err) return res.json({status:"erro"});
        res.json({status:"ativado"});
    });
});
