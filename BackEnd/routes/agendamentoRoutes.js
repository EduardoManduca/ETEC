const express = require("express");
const router = express.Router();
const agendamentoController = require("../controllers/agendamentoController");

router.post("/", agendamentoController.createAgendamento);
router.get("/", agendamentoController.getAgendamentos);
router.delete("/:id", agendamentoController.deleteAgendamento);

module.exports = router;