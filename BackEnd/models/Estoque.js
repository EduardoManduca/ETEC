const mongoose = require("mongoose");
const { ItemSchema } = require("./Item.js");

//==========================
// SCHEMA DE ESTOQUE
//==========================

const EstoqueSchema = new mongoose.Schema({
  reagentes: { type: [ItemSchema], default: [] },
  materiais: { type: [ItemSchema], default: [] },
  vidrarias: { type: [ItemSchema], default: [] },
  atualizadoEm: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Estoque || mongoose.model("Estoque", EstoqueSchema);