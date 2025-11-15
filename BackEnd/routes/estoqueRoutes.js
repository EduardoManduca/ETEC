const express = require("express");
const router = express.Router();
const estoqueController = require("../controllers/estoqueController");

//=======================================
// Rotas para gerenciamento de estoque
//=======================================

router.get("/", estoqueController.getEstoque);                      // Rota para obter todo o estoque
router.delete("/", estoqueController.deleteAllEstoque);             // Rota para deletar todo o estoque
router.post("/:tipo", estoqueController.addEstoqueItem);            // Adicionar item ao estoque
router.patch("/:tipo/:nome", estoqueController.updateEstoqueItem);  // Atualizar item do estoque
router.delete("/:tipo/:nome", estoqueController.deleteEstoqueItem); // Deletar item do estoque

module.exports = router;