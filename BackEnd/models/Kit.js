const mongoose = require("mongoose");
const { ItemSchema } = require("./Item.js");

const KitSchema = new mongoose.Schema({
  nomeKit: { type: String, required: true },
  materiais: { type: [ItemSchema], default: [] },
  equipamentos: { type: [ItemSchema], default: [] },
  observacoes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["solicitado", "autorizado"],
    default: "solicitado",
  },
  dataCriacao: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Kit", KitSchema);