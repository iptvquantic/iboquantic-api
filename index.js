const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

// CONFIG
app.use(cors());
app.use(express.json());

// PORTA CORRETA (Railway usa automaticamente)
const PORT = process.env.PORT || 3000;

// CONEXÃO MYSQL
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// CONECTAR MYSQL
db.connect(err => {
    if (err) {
        console.error("❌ Erro MySQL:", err);
    } else {
        console.log("✅ MySQL conectado");
    }
});

// SERVIR FRONTEND
app.use(express.static("public"));

// 🔥 ROTA PRINCIPAL (IMPORTANTE PRO RAILWAY)
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// 🔥 HEALTHCHECK (RAILWAY USA ISSO)
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// ROTAS API

app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

app.get("/user", (req, res) => {
    const { mac } = req.query;

    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result[0] || {});
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

// START SERVIDOR
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
