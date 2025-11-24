const Kit = require("../models/Kit.js");
const Agendamento = require("../models/Agendamento.js");
const Historico = require("../models/Historico.js");

// ==================================
// Obter Histórico de Materiais
// ==================================

exports.getHistoricoMateriais = async (req, res) => {
    try {
        const registros = await Historico.find({ deleted: { $ne: true } }).sort({ data: -1 }).lean();
        return res.json(registros);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar histórico de materiais." });
    }
};

// ==========================
// Apagar histórico de materiais
// ==========================
exports.deleteHistoricoMateriais = async (req, res) => {
    try {
        const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : null;

        if (ids && ids.length) {
            const result = await Historico.updateMany({ _id: { $in: ids.map(id => id) } }, { $set: { deleted: true } });
            return res.json({ message: `Marcou ${result.modifiedCount || result.nModified || 0} registro(s) do histórico como apagado.` });
        }

        const result = await Historico.updateMany({ deleted: { $ne: true } }, { $set: { deleted: true } });
        return res.json({ message: `Marcou ${result.modifiedCount || result.nModified || 0} registro(s) do histórico como apagado.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao apagar histórico de materiais." });
    }
};