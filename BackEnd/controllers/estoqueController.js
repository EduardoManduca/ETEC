const Estoque = require("../models/Estoque.js");

// ==================================
// Obter Estoque
// ==================================

exports.getEstoque = async (req, res) => {
    try {
        let estoque = await Estoque.findOne();
        if (!estoque) {
            estoque = new Estoque({ reagentes: [], vidrarias: [], materiais: [] });
            await estoque.save();
        }
        res.json(estoque);
    } catch (err) {
        res.status(500).json({ error: "Erro ao carregar estoque: " + err.message });
    }
};

// ==================================
// Adicionar Item ao Estoque
// =================================

exports.addEstoqueItem = async (req, res) => {
    try {
        const { tipo } = req.params;
        const { nome, quantidade, unidade } = req.body;
        if (!["reagentes", "materiais", "vidrarias"].includes(tipo))
            return res.status(400).json({ error: "Tipo inválido." });

        if (!nome || quantidade == null || quantidade < 0 || !unidade)
            return res.status(400).json({ error: "Nome, quantidade e unidade são obrigatórios." });

        let estoque = await Estoque.findOne();
        if (!estoque) estoque = new Estoque();

        const nomeLimpo = nome.trim();
        const itemExistente = estoque[tipo].find(i => i.nome.toLowerCase() === nomeLimpo.toLowerCase());

        if (itemExistente) {
            itemExistente.quantidade += quantidade;
            itemExistente.unidade = unidade;
        } else {
            estoque[tipo].push({ nome: nomeLimpo, quantidade, unidade });
        }

        estoque.atualizadoEm = new Date();
        await estoque.save();
        res.status(201).json({ message: "✅ Item adicionado ao estoque!", estoque });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================================
// Atualizar Item do Estoque
// ==================================

exports.updateEstoqueItem = async (req, res) => {
    try {
        const { tipo, nome } = req.params;
        const { quantidade } = req.body;
        if (!["reagentes", "materiais", "vidrarias"].includes(tipo))
            return res.status(400).json({ error: "Tipo inválido." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(404).json({ error: "Estoque não encontrado." });

        if (!estoque[tipo]) {
            return res.status(404).json({ error: `Tipo de estoque '${tipo}' não encontrado.` });
        }

        const item = estoque[tipo].find(i => i.nome === nome);
        if (!item) return res.status(404).json({ error: `Item '${nome}' não encontrado.` });

        item.quantidade = quantidade;
        estoque.atualizadoEm = new Date();
        await estoque.save();
        res.json({ message: "✅ Quantidade atualizada com sucesso!", estoque });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================================
// Deletar Item do Estoque
// ==================================

exports.deleteEstoqueItem = async (req, res) => {
    try {
        const { tipo, nome } = req.params;
        if (!["reagentes", "materiais", "vidrarias"].includes(tipo))
            return res.status(400).json({ error: "Tipo inválido." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(404).json({ error: "Estoque não encontrado." });

        if (!estoque[tipo]) {
            return res.status(404).json({ error: `Tipo de estoque '${tipo}' não encontrado.` });
        }

        const index = estoque[tipo].findIndex(i => i.nome === nome);
        if (index === -1) return res.status(404).json({ error: `Item '${nome}' não encontrado.` });

        estoque[tipo].splice(index, 1);
        estoque.atualizadoEm = new Date();
        await estoque.save();

        res.json({ message: `✅ Item '${nome}' excluído com sucesso!`, estoque });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ==================================
// Apagar Todo o Estoque
// ==================================

exports.deleteAllEstoque = async (req, res) => {
    try {
        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(404).json({ error: "Estoque não encontrado." }); 

        estoque.reagentes = [];
        estoque.vidrarias = [];
        estoque.materiais = [];

        estoque.atualizadoEm = new Date();
        await estoque.save();

        res.json({ message: "✅ Estoque (reagentes, vidrarias, materiais) apagado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};