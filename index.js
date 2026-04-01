const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// SERVIR FRONTEND (PAINEL)
app.use(express.static("public"));

// CONEXÃO MYSQL (RAILWAY)
const db = mysql.createConnection({
    host: "hopper.proxy.rlwy.net",
    user: "root",
    password: "ttpcqXvFipaxGZIsUzIlPIqhtoJFRCML",
    database: "railway",
    port: 40792
});

db.connect(err => {
    if (err) {
        console.error("Erro MySQL:", err);
    } else {
        console.log("MySQL conectado 🚀");
    }
});

// ROTA TESTE
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// LISTAR TODOS
app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});

// BUSCAR POR MAC
app.get("/user", (req, res) => {
    const { mac } = req.query;

    db.query("SELECT * FROM users WHERE mac = ?", [mac], (err, result) => {
        if (err) return res.json(err);
        res.json(result[0]);
    });
});

// ATIVAR
app.get("/ativar", (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo = 1 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json(err);
        res.json({ status: "ativado" });
    });
});

// DESATIVAR
app.get("/desativar", (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo = 0 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json(err);
        res.json({ status: "desativado" });
    });
});

app.listen(3000, () => {
    console.log("API rodando na porta 3000 🚀");
});
