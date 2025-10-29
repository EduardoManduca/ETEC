const mongoose = require("mongoose");

const AgendamentoSchema = new mongoose.Schema({
    laboratorio: { type: String, required: true },
    data: { type: Date, required: true },
    horario: { type: String, required: true },
    kit: { type: String, required: true },
    materiais: { type: [String], default: [] },
    reagentes: { type: [String], default: [] },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true }

});

module.exports = mongoose.model("Agendamento", AgendamentoSchema);
