const express = require("express");
const router = express.Router();
const historicoController = require("../controllers/historicoController");

//=======================================
// Rota para histórico de materiais
//=======================================

router.get("/", historicoController.getHistoricoMateriais);  // Rota para obter todo o histórico de materiais
router.delete("/", historicoController.deleteHistoricoMateriais); // Marca histórico como apagado

module.exports = router;