const bcrypt = require("bcrypt");
const Usuario = require("../models/Usuarios.js");

// ===============================
// Listar usuários
// ===============================

exports.getUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find({}, "-password");
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===============================
// Atualizar usuário
// ===============================  

exports.updateUsuario = async (req, res) => {
    try {
        const { login, password, funcao } = req.body;
        const updateData = { login, funcao };

        if (password)
            updateData.password = await bcrypt.hash(password, 10);

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select("-password"); // Não retorna a senha

        res.json(usuarioAtualizado);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// ===============================
// Excluir usuário
// ===============================
exports.deleteUsuario = async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ message: "Usuário excluído com sucesso!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};