const express = require("express");
const router = express.Router();
const agendamentoController = require("../controllers/agendamentoController");

//=======================================
// Rotas para gerenciamento de agendamentos
//=======================================

router.post("/", agendamentoController.createAgendamento);                  // Rota para criar um novo agendamento
router.get("/", agendamentoController.getAgendamentos);                     // Rota para obter todos os agendamentos
router.delete("/:id", agendamentoController.deleteAgendamento);             // Rota para deletar um agendamento pelo ID

module.exports = router;