const express = require("express");
const router = express.Router();
const estoqueController = require("../controllers/estoqueController");

router.get("/", estoqueController.getEstoque);
router.delete("/", estoqueController.deleteAllEstoque); // Rota para apagar tudo
router.post("/:tipo", estoqueController.addEstoqueItem);
router.patch("/:tipo/:nome", estoqueController.updateEstoqueItem);
router.delete("/:tipo/:nome", estoqueController.deleteEstoqueItem);

module.exports = router;