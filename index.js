const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.static("painel"));
app.use(express.json());

const PORT = process.env.PORT || 8080;

const checkJWT = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ erro: "Token não enviado" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ erro: "Token inválido" });
    }
};

const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.connect(err => {
    if (err) console.error("Erro MySQL:", err);
    else console.log("MySQL conectado");
});

app.get("/", (req, res) => res.send("IBOQUANTIC API ONLINE"));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/user", (req, res) => {
    const { mac } = req.query;
    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err) return res.json({});
        const u = result[0];
        if (!u) return res.json({});
        if (u.expiracao && new Date(u.expiracao) < new Date()) {
            return res.json({ ativo: 0, expirado: true });
        }
        res.json(u);
    });
});

app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    db.query("SELECT * FROM admins WHERE email=?", [email], async (err, result) => {
        if (err || result.length === 0) return res.status(401).json({ erro: "Usuário não encontrado" });
        const admin = result[0];
        const senhaValida = await bcrypt.compare(senha, admin.senha);
        if (!senhaValida) return res.status(401).json({ erro: "Senha inválida" });
        const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token });
    });
});

app.get("/all", checkJWT, (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.json([]);
        res.json(result);
    });
});

app.post("/create", checkJWT, (req, res) => {
    const { mac, nome, usuario, senha, dns, url, expiracao } = req.body;
    db.query("INSERT INTO users (mac, nome, usuario, senha, dns, ativo, expiracao) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [mac, nome, usuario||'', senha||'', dns||url||'', expiracao||null],
        err => {
            if (err) return res.json({ status: "erro", msg: err.message });
            res.json({ status: "criado" });
        });
});

app.put("/update/:id", checkJWT, (req, res) => {
    const { mac, nome, usuario, senha, dns, url, expiracao } = req.body;
    db.query("UPDATE users SET mac=?, nome=?, usuario=?, senha=?, dns=?, expiracao=? WHERE id=?",
        [mac, nome, usuario||'', senha||'', dns||url||'', expiracao||null, req.params.id],
        err => {
            if (err) return res.json({ status: "erro", msg: err.message });
            res.json({ status: "atualizado" });
        });
});

app.delete("/delete/:id", checkJWT, (req, res) => {
    db.query("DELETE FROM users WHERE id=?", [req.params.id], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "deletado" });
    });
});

app.get("/ativar", checkJWT, (req, res) => {
    db.query("UPDATE users SET ativo=1 WHERE mac=?", [req.query.mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "ativado" });
    });
});

app.get("/desativar", checkJWT, (req, res) => {
    db.query("UPDATE users SET ativo=0 WHERE mac=?", [req.query.mac], err => {
        if (err) return res.json({ status: "erro" });
        res.json({ status: "desativado" });
    });
});

app.post("/replace-domain", checkJWT, (req, res) => {
    const { antigo, novo } = req.body;
    db.query("UPDATE users SET dns=REPLACE(dns, ?, ?) WHERE dns LIKE ?",
        [antigo, novo, '%'+antigo+'%'],
        (err, result) => {
            if (err) return res.json({ status: "erro" });
            res.json({ status: "ok", affected: result.affectedRows });
        });
});

app.listen(PORT, "0.0.0.0", () => console.log("Servidor na porta " + PORT));

// ENDPOINT PARA O APP (formato AppInfoModel)
app.get("/user-mac", (req, res) => {
    const { mac } = req.query;
    if (!mac) return res.json({ success: false });
    
    db.query("SELECT * FROM users WHERE mac=?", [mac], (err, result) => {
        if (err || result.length === 0) {
            return res.json({ success: false, result: [] });
        }
        const u = result[0];
        
        // Verifica expiração
        if (u.expiracao && new Date(u.expiracao+'T00:00:00') < new Date()) {
            return res.json({ success: false, expired: true, result: [] });
        }
        
        res.json({
            success: u.ativo == 1,
            mac_address: u.mac,
            expiredDate: u.expiracao || "2099-12-31",
            lock: u.ativo == 1 ? 0 : 1,
            is_trial: 0,
            pin_code: "",
            plan_id: "1",
            result: u.dns ? [{
                url: u.dns,
                username: u.usuario || "",
                password: u.senha || "",
                type: "xtream"
            }] : (u.url ? [{
                url: u.url,
                username: "",
                password: "",
                type: "m3u8"
            }] : [])
        });
    });
});
