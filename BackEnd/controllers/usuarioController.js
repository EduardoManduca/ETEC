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

exports.validateUsuario = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "parâmetro userId não foi fornecido." });
  }

  try {
    const user = await Usuario.findById(userId); 
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro de servidor." });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select("-password");

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
};