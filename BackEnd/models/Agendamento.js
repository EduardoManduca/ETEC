const mongoose = require("mongoose");

//==========================
// SCHEMA DE AGENDAMENTO
//==========================
const ItemSchemaAgendamento = new mongoose.Schema({
  nome: { type: String, required: true },
  quantidade: { type: Number, required: true }
});

const AgendamentoSchema = new mongoose.Schema({
  usuario: { type: String, required: true },       // login do usuário
  laboratorio: { type: String, required: true },   // laboratório agendado
  data: { type: Date, required: true },            // data do agendamento
  horario: { type: String, required: true },       // horário do agendamento
  kit: { type: String, default: "" },              // kit selecionado, se houver

  reagentes: { type: [ItemSchemaAgendamento], default: [] },
  vidrarias: { type: [ItemSchemaAgendamento], default: [] },
  materiais: { type: [ItemSchemaAgendamento], default: [] },

  createdAt: { type: Date, default: Date.now }     // timestamp de criação
});

//==========================
// INDICES
//==========================

// expira documentos após 24h
// AgendamentoSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });
// Comentado caso não seja desejado

// Garante que não haja conflito de agendamento no mesmo laboratório, data e horário
AgendamentoSchema.index({ laboratorio: 1, data: 1, horario: 1 }, { unique: true });

// Modificado para evitar sobrescrita
module.exports = mongoose.models.Agendamento || mongoose.model("Agendamento", AgendamentoSchema);