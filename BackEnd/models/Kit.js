const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantidade: { type: Number, default: 1 },
});

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
