const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");

//=======================================
// Rotas para gerenciamento de usuários
//=======================================

router.get("/", usuarioController.getUsuarios);                     // Rota para obter todos os usuários
router.get("/:id", usuarioController.getUsuarioById);      // Rota para obter um usuário pelo ID
router.put("/:id", usuarioController.updateUsuario);                // Rota para atualizar um usuário pelo ID
router.delete("/:id", usuarioController.deleteUsuario);             // Rota para deletar um usuário pelo ID
router.post("/validate", usuarioController.validateUsuario);        // Rota para validar um usuário na base de dados

module.exports = router;