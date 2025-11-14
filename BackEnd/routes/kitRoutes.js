const express = require("express");
const router = express.Router();
const kitController = require("../controllers/kitController");

router.post("/", kitController.createKit);
router.get("/", kitController.getKits);
router.patch("/:id/status", kitController.updateKitStatus);
router.delete("/:id", kitController.deleteKit);

module.exports = router;