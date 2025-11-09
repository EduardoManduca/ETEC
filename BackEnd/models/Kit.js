const mongoose = require("mongoose");
const { ItemSchema } = require("./Item.js");

const KitSchema = new mongoose.Schema({
  nomeKit: { type: String, required: true },
  reagentes: { type: [ItemSchema], default: [] },
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

// ========================
// Validação de duplicados antes de salvar o Kit
// ========================

KitSchema.pre("save", function (next) {
  const nomesMateriais = this.materiais.map(i => i.nome.toLowerCase());
  const nomesEquipamentos = this.equipamentos.map(i => i.nome.toLowerCase());

  const dupMateriais = nomesMateriais.filter((v, i, a) => a.indexOf(v) !== i);
  const dupEquipamentos = nomesEquipamentos.filter((v, i, a) => a.indexOf(v) !== i);

  if (dupMateriais.length > 0) {
    return next(new Error(`Materiais duplicados: ${[...new Set(dupMateriais)].join(", ")}`));
  }
  if (dupEquipamentos.length > 0) {
    return next(new Error(`Equipamentos duplicados: ${[...new Set(dupEquipamentos)].join(", ")}`));
  }

  next();
});

module.exports = mongoose.model("Kit", KitSchema);
