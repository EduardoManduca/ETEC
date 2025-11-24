const mongoose = require('mongoose');

const HistoricoSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now },
  professor: { type: String, default: 'Desconhecido' },
  nome: { type: String, required: true },
  quantidade: { type: Number, default: 0 },
  unidade: { type: String, default: '' },
  tipo: { type: String, enum: ['reagente', 'material', 'vidraria'], default: 'material' },
  source: { type: String, enum: ['kit', 'agendamento'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Historico', HistoricoSchema);
