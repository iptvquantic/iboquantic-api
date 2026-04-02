require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

// 🔐 MIDDLEWARE API KEY (LEGADO)
const checkApiKey = (req, res, next) => {
    const key = req.headers['x-api-key'];
    if (!key || key !== process.env.API_KEY) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
};

// 🔐 MIDDLEWARE JWT
const checkJWT = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ erro: "Token não enviado" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: "Token inválido" });
    }
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

// DEBUG
console.log("HOST:", process.env.MYSQLHOST);
console.log("DB:", process.env.MYSQLDATABASE);

// ROOT
app.get("/", (req, res) => {
    res.send("API ONLINE 🚀");
});

// HEALTH
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// 🔓 APP IPTV (PÚBLICO)
app.get("/user", (req, res) => {
    const { mac } = req.query;

    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.json({});
        res.json(result[0] || {});
    });
});

// 🔐 LOGIN ADMIN (NOVO)
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    db.query("SELECT * FROM admins WHERE email=?", [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const admin = result[0];

        const senhaValida = await bcrypt.compare(senha, admin.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token });
    });
});

// 🔐 PROTEGIDO COM JWT
app.get("/all", checkJWT, (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.json([]);
        res.json(result);
    });
});

app.get("/ativar", checkJWT, (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=1 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

app.get("/desativar", checkJWT, (req, res) => {
    const { mac } = req.query;

    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

app.post("/create", checkJWT, (req, res) => {
    const { mac, nome, usuario, senha, dns } = req.body;

    db.query(
        "INSERT INTO users (mac, nome, usuario, senha, dns, ativo) VALUES (?, ?, ?, ?, ?, 1)",
        [mac, nome, usuario, senha, dns],
        err => {
            if (err) return res.json({ status: "erro" });
            res.json({ status: "criado" });
        }
    );
});

// 🚀 START
app.listen(PORT, "0.0.0.0", () => {
    console.log("🚀 Servidor rodando na porta " + PORT);
});
// force redeploy Thu Apr  2 14:32:45 -03 2026
