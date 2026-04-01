const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 SERVIR PAINEL (HTML)
app.use(express.static("public"));

// 🔥 CONEXÃO MYSQL (Railway)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// 🔥 CONECTAR
db.connect(err => {
    if (err) {
        console.error("Erro MySQL:", err);
    } else {
        console.log("MySQL conectado 🚀");
    }
});

// 🔥 ROTA TESTE
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// 🔥 LISTAR TODOS
app.get("/all", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) return res.json({ erro: err });
        res.json(result);
    });
});

// 🔥 BUSCAR POR MAC
app.get("/user", (req, res) => {
    const mac = req.query.mac;

    db.query("SELECT * FROM usuarios WHERE mac = ?", [mac], (err, result) => {
        if (err) return res.json({ erro: err });

        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.json({ erro: "não encontrado" });
        }
    });
});

// 🔥 CADASTRAR
app.get("/cadastrar", (req, res) => {
    const mac = req.query.mac;

    db.query("INSERT INTO usuarios (mac, ativo) VALUES (?, 0)", [mac], (err) => {
        if (err) return res.json({ erro: err });

        res.json({ status: "cadastrado" });
    });
});

// 🔥 ATIVAR
app.get("/ativar", (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE usuarios SET ativo = 1 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: err });

        res.json({ status: "ativado" });
    });
});

// 🔥 DESATIVAR
app.get("/desativar", (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE usuarios SET ativo = 0 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: err });

        res.json({ status: "desativado" });
    });
});

// 🔥 PORTA (IMPORTANTE PRA RAILWAY)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("API rodando na porta " + PORT);
});
