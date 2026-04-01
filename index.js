const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔥 CONEXÃO SEGURA (NÃO DERRUBA APP)
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 5
});

// 🔥 TESTE API
app.get("/", (req, res) => {
    res.send("API IBO QUANTIC ONLINE 🚀");
});

// 🔥 LISTAR
app.get("/all", (req, res) => {
    db.query("SELECT * FROM usuarios", (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ erro: "erro banco" });
        }
        res.json(result);
    });
});

// 🔥 BUSCAR
app.get("/user", (req, res) => {
    const mac = req.query.mac;

    db.query("SELECT * FROM usuarios WHERE mac = ?", [mac], (err, result) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json(result[0] || {});
    });
});

// 🔥 CADASTRAR
app.get("/cadastrar", (req, res) => {
    const mac = req.query.mac;

    db.query("INSERT INTO usuarios (mac, ativo) VALUES (?, 0)", [mac], (err) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json({ status: "cadastrado" });
    });
});

// 🔥 ATIVAR
app.get("/ativar", (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE usuarios SET ativo = 1 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json({ status: "ativado" });
    });
});

// 🔥 DESATIVAR
app.get("/desativar", (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE usuarios SET ativo = 0 WHERE mac = ?", [mac], (err) => {
        if (err) return res.json({ erro: "erro banco" });

        res.json({ status: "desativado" });
    });
});

// 🔥 PORTA CORRETA
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor rodando 🚀 porta " + PORT);
});
