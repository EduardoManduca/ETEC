const mongoose = require("mongoose");

const AgendamentoSchema = new mongoose.Schema({
  laboratorio: { type: String, required: true },
  data: { type: Date, required: true },
  horario: { type: String, required: true },
  kit: { type: String, required: true },
  materiais: { type: [String], default: [] },
  reagentes: { type: [String], default: [] },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  status: { type: String, default: "Pendente" },

  // -- Data de criação --
  createdAt: { type: Date, default: Date.now }
});

// -- Apaga automaticamente 24h depois do término do agendamento --
AgendamentoSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 } // 24h
);

module.exports = mongoose.model("Agendamento", AgendamentoSchema);
