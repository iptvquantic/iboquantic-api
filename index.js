const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔥 MYSQL (POOL ESTÁVEL)
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// 🔥 ROTA PRINCIPAL (OBRIGATÓRIA PRO RAILWAY)
app.get("/", (req, res) => {
    res.status(200).send("OK 🚀");
});

// 🔥 HEALTHCHECK (IMPORTANTE)
app.get("/health", (req, res) => {
    res.json({ status: "online" });
});

// 🔥 TESTE BANCO (SEM TRAVAR)
app.get("/all", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) {
            console.error("ERRO MYSQL:", err);
            return res.status(500).json({ erro: "banco offline" });
        }
        res.json(result);
    });
});

// 🔥 ATIVAR
app.get("/ativar", (req, res) => {
    const mac = req.query.mac;

    if (!mac) return res.json({ erro: "mac obrigatório" });

    db.query("UPDATE usuarios SET ativo = 1 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json({ status: "ativado" });
    });
});

// 🔥 DESATIVAR
app.get("/desativar", (req, res) => {
    const mac = req.query.mac;

    if (!mac) return res.json({ erro: "mac obrigatório" });

    db.query("UPDATE usuarios SET ativo = 0 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json({ status: "desativado" });
    });
});

// 🔥 PORTA CORRETA (CRÍTICO)
const PORT = process.env.PORT || 3000;

// 🔥 ESCUTAR EM TODAS INTERFACES
app.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor rodando 🚀 porta " + PORT);
});
