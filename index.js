const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// PORTA
const PORT = process.env.PORT || 8080;

// 🔐 MIDDLEWARE DE SEGURANÇA
const checkAuth = (req, res, next) => {
    const key = req.headers['x-api-key'];

    if (!key || key !== process.env.API_KEY) {
        return res.status(401).json({ erro: "Não autorizado" });
    }

    next();
};

// 🔥 CONEXÃO MYSQL
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect(err => {
    if (err) {
        console.error("❌ Erro MySQL:", err);
    } else {
        console.log("✅ MySQL conectado 🚀");
    }
});

// 📁 SERVIR PASTA PUBLIC
app.use(express.static(path.join(__dirname, "public")));

// 🏠 CARREGAR PAINEL
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ❤️ HEALTHCHECK
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// 🔓 PÚBLICO (APP IPTV)
app.get("/user", (req, res) => {
    const { mac } = req.query;

    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.json({});
        res.json(result[0] || {});
    });
});

// 🔐 PROTEGIDO

// LISTAR TODOS
app.get("/all", checkAuth, (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.json([]);
        res.json(result);
    });
});

// ATIVAR
app.get("/ativar", checkAuth, (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

// DESATIVAR
app.get("/desativar", checkAuth, (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

// 🆕 CRIAR USUÁRIO
app.post("/create", checkAuth, (req, res) => {
    const { mac, nome, usuario, senha, dns } = req.body;

    if (!mac) {
        return res.json({ status: "erro", mensagem: "MAC obrigatório" });
    }

    db.query(
        "INSERT INTO users (mac, nome, usuario, senha, dns, ativo) VALUES (?, ?, ?, ?, ?, 1)",
        [mac, nome, usuario, senha, dns],
        err => {
            if (err) {
                console.error(err);
                return res.json({ status: "erro" });
            }
            res.json({ status: "criado" });
        }
    );
});

// 🚀 START
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
