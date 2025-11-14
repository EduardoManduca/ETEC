const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuarios.js");

// --- Cadastro de usuário ---
exports.signup = async (req, res) => {
    try {
        const { login, password, funcao } = req.body;
        if (!login || !password || !funcao)
            return res.status(400).json({ error: "Todos os campos são obrigatórios." });

        const existente = await Usuario.findOne({ login });
        if (existente)
            return res.status(409).json({ error: "Usuário já existe!" });

        const passwordHash = await bcrypt.hash(password, 10);
        const novoUsuario = new Usuario({ login, password: passwordHash, funcao });
        await novoUsuario.save();

        res.status(201).json({ message: "✅ Usuário cadastrado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar usuário." });
    }
};

// --- Login ---
exports.login = async (req, res) => {
    try {
        const { login, password } = req.body;
        const usuario = await Usuario.findOne({ login });
        if (!usuario)
            return res.status(401).json({ error: "Usuário não encontrado" });

        const senhaValida = await bcrypt.compare(password, usuario.password);
        if (!senhaValida)
            return res.status(401).json({ error: "Senha incorreta" });

        res.json({
            message: "Login bem-sucedido",
            usuario: { _id: usuario._id.toString(), funcao: usuario.funcao }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};