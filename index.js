const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔥 CRIA POOL (MELHOR QUE createConnection)
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

// 🧠 HEALTHCHECK (RESPONDE SEM DEPENDER DO MYSQL)
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

// 🏠 ROTA PRINCIPAL
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// 📋 LISTAR TODOS
app.get("/all", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) {
            console.error("Erro /all:", err);
            return res.status(500).json([]);
        }
        res.json(result);
    });
});

// 🔍 BUSCAR POR MAC
app.get("/user", (req, res) => {
    const { mac } = req.query;

    if (!mac) {
        return res.status(400).json({ erro: "MAC não informado" });
    }

    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) {
            console.error("Erro /user:", err);
            return res.status(500).json({});
        }
        res.json(result[0] || {});
    });
});

// ✅ ATIVAR
app.get("/ativar", (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

// ❌ DESATIVAR
app.get("/desativar", (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

// 🚀 START (FORÇANDO RAILWAY)
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
