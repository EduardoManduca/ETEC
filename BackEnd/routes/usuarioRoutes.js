const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

//=======================================
// Rotas para gerenciamento de usuários
//=======================================

router.get("/", usuarioController.getUsuarios);                     // Rota para obter todos os usuários
router.put("/:id", usuarioController.updateUsuario);                // Rota para atualizar um usuário pelo ID
router.delete("/:id", usuarioController.deleteUsuario);             // Rota para deletar um usuário pelo ID

module.exports = router;