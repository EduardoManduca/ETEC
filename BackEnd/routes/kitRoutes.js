const express = require("express");
const router = express.Router();
const kitController = require("../controllers/kitController");

//=======================================
// Rotas para gerenciamento de kits
//=======================================   

router.post("/", kitController.createKit);                   // Rota para criar um novo kit
router.get("/", kitController.getKits);                      // Rota para obter todos os kits
router.patch("/:id/status", kitController.updateKitStatus);  // Rota para atualizar o status de um kit
router.delete("/:id", kitController.deleteKit);              // Rota para deletar um kit

module.exports = router;