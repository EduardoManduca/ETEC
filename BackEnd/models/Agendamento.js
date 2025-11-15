const mongoose = require("mongoose");

//==========================
// SCHEMA DE AGENDAMENTO
//==========================
const ItemSchemaAgendamento = new mongoose.Schema({
  nome: { type: String, required: true },          // nome do item 
  quantidade: { type: Number, required: true }    // quantidade do item
});

const AgendamentoSchema = new mongoose.Schema({
  usuario: { type: String, required: true },       // login do usuário
  laboratorio: { type: String, required: true },   // laboratório agendado
  data: { type: Date, required: true },            // data do agendamento
  horario: { type: String, required: true },       // horário do agendamento
  kit: { type: String, default: "" },              // kit selecionado, se houver

  reagentes: { type: [ItemSchemaAgendamento], default: [] }, // lista de reagentes
  vidrarias: { type: [ItemSchemaAgendamento], default: [] }, // lista de vidrarias
  materiais: { type: [ItemSchemaAgendamento], default: [] }, // lista de materiais

  createdAt: { type: Date, default: Date.now }     // timestamp de criação
});

//==========================
// INDICES
//==========================

AgendamentoSchema.index({ laboratorio: 1, data: 1, horario: 1 }, { unique: true }); // Evita agendamentos duplicados no mesmo laboratório, data e horário

module.exports = mongoose.models.Agendamento || mongoose.model("Agendamento", AgendamentoSchema);