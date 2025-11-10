const mongoose = require("mongoose");

// ========================
// Definição do schema para itens (reagentes, materiais, vidrarias)
// ========================
const ItemSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true, set: v => v.replace(/\s+/g, " ") },
    quantidade: { type: Number, default: 1, min: 0 },
    descricao: { type: String, trim: true, set: v => v.replace(/\s+/g, " ") },
    unidade: { type: String, default: "" }
});

const Item = mongoose.model("Item", ItemSchema);
module.exports = { ItemSchema, Item };
