const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// PORTA (Railway usa automaticamente)
const PORT = process.env.PORT || 3000;

// 🔥 CONEXÃO MYSQL CORRETA (OBRIGATÓRIO)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// 🔥 NÃO DEIXA O SERVIDOR MORRER
db.connect(err => {
    if (err) {
        console.error("❌ Erro MySQL:", err);
    } else {
        console.log("✅ MySQL conectado 🚀");
    }
});

// SERVIR PAINEL
app.use(express.static("public"));

// ROTA PRINCIPAL
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// LISTAR TODOS
app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(result);
    });
});

// BUSCAR POR MAC
app.get("/user", (req, res) => {
    const { mac } = req.query;
    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.json({});
        res.json(result[0] || {});
    });
});

// ATIVAR
app.get("/ativar", (req, res) => {
    const { mac } = req.query;
    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

// DESATIVAR
app.get("/desativar", (req, res) => {
    const { mac } = req.query;
    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

// START
app.listen(PORT, () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
