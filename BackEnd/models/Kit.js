const mongoose = require("mongoose");
const { ItemSchema } = require("./Item.js");

const KitSchema = new mongoose.Schema({
  nomeKit: { type: String, required: true },
  reagentes: { type: [ItemSchema], default: [] },
  materiais: { type: [ItemSchema], default: [] },
  vidrarias: { type: [ItemSchema], default: [] },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  observacoes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["solicitado", "autorizado"],
    default: "solicitado",
  },
  historicoApagado: { type: Boolean, default: false },
  dataCriacao: { type: Date, default: Date.now },
});

// ========================
// Validação de duplicados
// ========================
KitSchema.pre("save", function (next) {
  const nomesMateriais = this.materiais.map(i => i.nome.toLowerCase());
  const nomesVidrarias = this.vidrarias.map(i => i.nome.toLowerCase());
  const dupMateriais = nomesMateriais.filter((v, i, a) => a.indexOf(v) !== i);
  const dupVidrarias = nomesVidrarias.filter((v, i, a) => a.indexOf(v) !== i);

  if (dupMateriais.length > 0) {
    return next(new Error(`Materiais duplicados: ${[...new Set(dupMateriais)].join(", ")}`));
  }
  if (dupVidrarias.length > 0) {
    return next(new Error(`Vidrarias duplicadas: ${[...new Set(dupVidrarias)].join(", ")}`));
  }

  next();
});

module.exports = mongoose.model("Kit", KitSchema);
