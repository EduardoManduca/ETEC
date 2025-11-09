//==========================
// IMPORTAÇÕES
//==========================
const mongoose = require("mongoose");
const { ItemSchema } = require("./Item.js");

//==========================
// SCHEMA DE ESTOQUE
//==========================
const EstoqueSchema = new mongoose.Schema({
  reagentes: { type: [ItemSchema], default: [] },   // lista de reagentes
  materiais: { type: [ItemSchema], default: [] },   // lista de materiais
  equipamentos: { type: [ItemSchema], default: [] },// lista de equipamentos
  atualizadoEm: { type: Date, default: Date.now }   // timestamp da última atualização
});

//==========================
// EXPORTAÇÃO DO MODELO DE ESTOQUE
//==========================
module.exports = mongoose.model("Estoque", EstoqueSchema);


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

  materiais: { type: [ItemSchemaAgendamento], default: [] },
  reagentes: { type: [ItemSchemaAgendamento], default: [] },
  equipamentos: { type: [ItemSchemaAgendamento], default: [] },

  createdAt: { type: Date, default: Date.now }     // timestamp de criação
});

//==========================
// INDICES
//==========================

// expira documentos após 24h
AgendamentoSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

// ========================================
// Garante que não haja conflito de agendamento no mesmo laboratório, data e horário
// ========================================

AgendamentoSchema.index({ laboratorio: 1, data: 1, horario: 1 }, { unique: true });

module.exports = mongoose.model("Agendamento", AgendamentoSchema);
