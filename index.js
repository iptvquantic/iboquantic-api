const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ USA A PORTA DO RAILWAY (OBRIGATÓRIO)
const PORT = process.env.PORT || 3000;

// 🔗 CONEXÃO MYSQL (RAILWAY)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST || "hopper.proxy.rlwy.net",
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "ttpcqXvFipaxGZIsUzIlPIqhtoJFRCML",
    database: process.env.MYSQLDATABASE || "railway",
    port: process.env.MYSQLPORT || 40792
});

// CONECTAR
db.connect(err => {
    if (err) {
        console.error("Erro MySQL:", err);
    } else {
        console.log("MySQL conectado 🚀");
    }
});

// SERVIR PAINEL
app.use(express.static("public"));

// ROTAS

app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

app.get("/user", (req, res) => {
    const { mac } = req.query;
    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]);
    });
});

app.get("/ativar", (req, res) => {
    const { mac } = req.query;
    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.status(500).json(err);
        res.json({ status: "ativado" });
    });
});

app.get("/desativar", (req, res) => {
    const { mac } = req.query;
    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.status(500).json(err);
        res.json({ status: "desativado" });
    });
});

// START
app.listen(PORT, () => {
    console.log("Servidor rodando 🚀 porta " + PORT);
});
