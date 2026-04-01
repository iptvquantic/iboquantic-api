const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// PORTA
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
        console.log("✅ MySQL conectado 🚀");
    }
});

// ROTA DE TESTE (IMPORTANTE PRO RAILWAY)
app.get("/", (req, res) => {
    res.status(200).send("API ONLINE 🚀");
});

// ROTA DE HEALTHCHECK (GARANTE QUE NÃO CAI)
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// SERVIR PAINEL
app.use(express.static("public"));

// LISTAR TODOS
app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json([]);
        }
        res.json(result);
    });
});

// BUSCAR POR MAC
app.get("/user", (req, res) => {
    const { mac } = req.query;

    if (!mac) {
        return res.status(400).json({ erro: "mac não enviado" });
    }

    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.status(500).json({});
        res.json(result[0] || {});
    });
});

// ATIVAR
app.get("/ativar", (req, res) => {
    const { mac } = req.query;

    if (!mac) {
        return res.status(400).json({ erro: "mac não enviado" });
    }

    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.status(500).json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

// DESATIVAR
app.get("/desativar", (req, res) => {
    const { mac } = req.query;

    if (!mac) {
        return res.status(400).json({ erro: "mac não enviado" });
    }

    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.status(500).json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

// START (CORRIGIDO)
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
