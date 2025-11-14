const Kit = require("../models/Kit.js");

exports.getHistoricoMateriais = async (req, res) => {
    try {
        const kits = await Kit.find({ status: "autorizado" })
            .sort({ updatedAt: -1 })
            .populate("usuario", "login"); // Popula o usuário para pegar o login

        const historico = [];

        kits.forEach(kit => {
            const data = kit.updatedAt || kit.createdAt || new Date();

            const adicionarAoHistorico = (itens, tipo) => {
                if (!itens) return;
                itens.forEach(i => {
                    historico.push({
                        data,
                        professor: kit.usuario && kit.usuario.login ? kit.usuario.login : "Usuário desconhecido",
                        material: i.nome,
                        quantidade: i.quantidade,
                        unidade: i.unidade || "",
                        tipo
                    });
                });
            };

            adicionarAoHistorico(kit.reagentes, "reagente");
            adicionarAoHistorico(kit.vidrarias, "vidraria");
            adicionarAoHistorico(kit.materiais, "material");
        });

        res.json(historico);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar histórico de materiais." });
    }
};