const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
    item: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: v => v.replace(/\s+/g, " ")
    },
    tipo: {
        type: String,
        enum: ["reagente", "vidraria"],
        required: true
    },
    quantidade: { type: Number, default: 1 },
    descricao: {
        type: String,
        trim: true,
        set: v => v.replace(/\s+/g, " ")
    }
});

const Item = mongoose.model("Item", ItemSchema);

module.exports = {
    ItemSchema,
    Item
};