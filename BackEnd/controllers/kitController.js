const Kit = require("../models/Kit.js");
const Estoque = require("../models/Estoque.js");
const Historico = require("../models/Historico.js");

// ===============================
// Criar Kit
// ===============================
exports.createKit = async (req, res) => {
    try {
        const {
            nomeKit,
            reagentes = [],
            vidrarias = [],
            materiais = [],
            observacoes = "",
            usuario
        } = req.body;

        if (!nomeKit || nomeKit.trim() === "")
            return res.status(400).json({ error: "O campo 'nomeKit' é obrigatório." });
        if (!usuario)
            return res.status(400).json({ error: "ID do usuário é obrigatório." });
        // Filtrar itens inválidos (nome vazio ou quantidade <= 0)
        const reagentesValidos = reagentes
            .filter(i => i.nome && i.nome.trim() !== "" && i.quantidade > 0)
            .map(i => ({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" }));
        const vidrariasValidas = vidrarias
            .filter(i => i.nome && i.nome.trim() !== "" && i.quantidade > 0)
            .map(i => ({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" }));
        const materiaisValidos = materiais
            .filter(i => i.nome && i.nome.trim() !== "" && i.quantidade > 0)
            .map(i => ({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" }));

        if (reagentesValidos.length === 0 && materiaisValidos.length === 0 && vidrariasValidas.length === 0)
            return res.status(400).json({ error: "Adicione ao menos um reagente, vidraria ou material válido." });

        const novoKit = new Kit({
            nomeKit: nomeKit.trim(),
            reagentes: reagentesValidos,
            vidrarias: vidrariasValidas,
            materiais: materiaisValidos,
            observacoes: observacoes.trim(),
            usuario
        });

        await novoKit.save();
        res.status(201).json({ message: "✅ Kit criado com sucesso!", kit: novoKit });
    } catch (err) {
        console.error("Erro ao criar kit:", err);
        res.status(500).json({ error: err.message });
    }
};

// ===============================
// Listar Kits
// ===============================
exports.getKits = async (req, res) => {
    try {
        const { apenasAutorizados } = req.query;
        const filtro = apenasAutorizados === "true" ? { status: "autorizado" } : {};
        const kits = await Kit.find(filtro).populate("usuario", "login");
        res.json(kits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ===============================
// Atualizar Status do Kit
// ===============================

exports.updateKitStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!["solicitado", "autorizado"].includes(status)) {
            return res.status(400).json({ error: "Status inválido." });
        }

        const kit = await Kit.findById(req.params.id);
        if (!kit) return res.status(404).json({ error: "Kit não encontrado." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(500).json({ error: "Estoque não encontrado." });

        function atualizarEstoque(itens, tipo, operacao) {
            if (!itens || !Array.isArray(itens)) return null;
            if (!estoque[tipo]) return `Tipo de estoque '${tipo}' inválido.`;

            for (const i of itens) {
                if (!i || !i.nome || typeof i.quantidade !== "number") continue;
                const nomeLimpo = i.nome.trim().toLowerCase();
                let itemEstoque = estoque[tipo].find(e => e.nome && e.nome.trim().toLowerCase() === nomeLimpo);

                if (!itemEstoque && operacao === "devolver") {
                    estoque[tipo].push({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" });
                } else if (!itemEstoque && operacao === "usar") {
                    return `Item '${i.nome}' (${tipo}) não encontrado no estoque.`;
                }

                if (itemEstoque) {
                    if (operacao === "usar") {
                        if (itemEstoque.quantidade < i.quantidade) return `Estoque insuficiente para ${i.nome} (${tipo})`;
                        itemEstoque.quantidade -= i.quantidade;
                    } else if (operacao === "devolver") {
                        itemEstoque.quantidade += i.quantidade;
                    }
                }
            }
            return null;
        }

        if (kit.status !== "autorizado" && status === "autorizado") {
            let erro = atualizarEstoque(kit.reagentes, "reagentes", "usar") ||
                atualizarEstoque(kit.vidrarias, "vidrarias", "usar") ||
                atualizarEstoque(kit.materiais, "materiais", "usar");

            if (erro) return res.status(400).json({ error: erro });
            estoque.atualizadoEm = new Date();
            await estoque.save();
            // Salvar no histórico os itens usados pelo kit autorizado
            try {
                const now = new Date();
                const estoque = await Estoque.findOne();
                const findUnitInEstoque = (nome) => {
                    if (!estoque) return '';
                    const tipos = ['reagentes', 'vidrarias', 'materiais'];
                    for (const t of tipos) {
                        const item = (estoque[t] || []).find(e => e.nome && e.nome.trim().toLowerCase() === String(nome).trim().toLowerCase());
                        if (item && item.unidade) return item.unidade;
                    }
                    return '';
                };

                const docs = [];
                const pushItens = (lista, tipo) => {
                    if (!lista || !Array.isArray(lista)) return;
                    lista.forEach(i => {
                        docs.push({
                            data: now,
                            professor: kit.usuario || 'Desconhecido',
                            nome: i.nome,
                            quantidade: i.quantidade || 0,
                            unidade: i.unidade || findUnitInEstoque(i.nome) || '',
                            tipo: tipo,
                            source: 'kit',
                            referenceId: kit._id
                        });
                    });
                };
                pushItens(kit.reagentes, 'reagente');
                pushItens(kit.vidrarias, 'vidraria');
                pushItens(kit.materiais, 'material');
                if (docs.length) await Historico.insertMany(docs);
            } catch (errH) {
                console.warn('Falha ao salvar histórico do kit autorizado:', errH.message || errH);
            }
        } else if (kit.status === "autorizado" && status !== "autorizado") {
            atualizarEstoque(kit.reagentes, "reagentes", "devolver");
            atualizarEstoque(kit.vidrarias, "vidrarias", "devolver");
            atualizarEstoque(kit.materiais, "materiais", "devolver");
            estoque.atualizadoEm = new Date();
            await estoque.save();
        }

        kit.status = status;
        await kit.save();
        res.json({ message: "✅ Status do kit atualizado!", kit });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar status do kit: " + err.message });
    }
};

// ===============================
// Excluir Kit
// ===============================

exports.deleteKit = async (req, res) => {
    try {
        const kit = await Kit.findById(req.params.id);
        if (!kit) return res.status(404).json({ error: "Kit não encontrado." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(500).json({ error: "Estoque não encontrado." });

        if (kit.status === "autorizado") {
            function devolverItens(itens, tipo) {
                if (!itens || !Array.isArray(itens)) return;
                if (!estoque[tipo]) return;

                for (const i of itens) {
                    if (!i || !i.nome || typeof i.quantidade !== "number") continue;
                    const nomeLimpo = i.nome.trim().toLowerCase();
                    let itemEstoque = estoque[tipo].find(e => e.nome && e.nome.trim().toLowerCase() === nomeLimpo);
                    if (itemEstoque) {
                        itemEstoque.quantidade += i.quantidade;
                    } else {
                        estoque[tipo].push({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" });
                    }
                }
            }
            devolverItens(kit.reagentes || [], "reagentes");
            devolverItens(kit.vidrarias || [], "vidrarias");
            devolverItens(kit.materiais || [], "materiais");

            estoque.atualizadoEm = new Date();
            await estoque.save();
        }

        await Kit.findByIdAndDelete(req.params.id);
        res.json({ message: "✅ Kit excluído com sucesso!" });
    } catch (err) {
        console.error("Erro ao excluir kit:", err);
        res.status(500).json({ error: "Erro ao excluir kit: " + err.message });
    }
};