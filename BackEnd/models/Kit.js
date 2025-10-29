const mongoose = require("mongoose");
const KitSchema = new mongoose.Schema({
    nomeKit: { type: String, required: true },
    materiais: { type: [String], default: [] },
    equipamentos: { type: [String], default: [] },
    observacoes: { type: String, default: "" },
    status: { type: String, enum: ["solicitado", "autorizado"], default: "solicitado" }
});

module.exports = mongoose.model("Kit", KitSchema);