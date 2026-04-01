app.get('/all', (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        res.json(result);
    });
});

app.get('/desativar', (req, res) => {
    const mac = req.query.mac;

    db.query("UPDATE users SET ativo=0 WHERE mac=?", [mac], (err) => {
        if (err) return res.json({status:"erro"});
        res.json({status:"desativado"});
    });
});

