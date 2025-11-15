const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

//=======================================
// Rotas para autenticação
//=======================================

router.post("/signup", authController.signup);             // Rota para cadastro de usuário
router.post("/login", authController.login);              // Rota para login de usuário

module.exports = router;