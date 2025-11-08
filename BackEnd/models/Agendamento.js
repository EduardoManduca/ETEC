const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, required: true }
});

const AgendamentoSchema = new mongoose.Schema({
  usuario: { type: String, required: true }, 
  laboratorio: { type: String, required: true },
  data: { type: Date, required: true },
  horario: { type: String, required: true },
  kit: { type: String, default: "" },

  materiais: { type: [ItemSchema], default: [] },
  reagentes: { type: [ItemSchema], default: [] },
  vidrarias: { type: [ItemSchema], default: [] },

  createdAt: { type: Date, default: Date.now }
});

// expira em 24h 
AgendamentoSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });
AgendamentoSchema.index({ laboratorio: 1, data: 1, horario: 1 }, { unique: true });

module.exports = mongoose.model("Agendamento", AgendamentoSchema);
