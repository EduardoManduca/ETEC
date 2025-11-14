const Agendamento = require("../models/Agendamento.js");
const Estoque = require("../models/Estoque.js");
const { converterHorarioParaMinutos } = require("../utils/horario.js");

// --- Criar Agendamento ---
exports.createAgendamento = async (req, res) => {
    const DURACAO_SLOT_EM_MINUTOS = 60;
    try {
        const { laboratorio, data, horario, ...restoDoBody } = req.body;

        const novoInicioMinutos = converterHorarioParaMinutos(horario);
        if (novoInicioMinutos === -1)
            return res.status(400).json({ error: "Formato de horário inválido. Use HH:MM." });

        const novoFimMinutos = novoInicioMinutos + DURACAO_SLOT_EM_MINUTOS;

        const dataObj = new Date(data);
        const inicioDoDia = new Date(dataObj.setUTCHours(0, 0, 0, 0));
        const fimDoDia = new Date(dataObj.setUTCHours(23, 59, 59, 999));

        const agendamentosExistentes = await Agendamento.find({
            laboratorio,
            data: { $gte: inicioDoDia, $lte: fimDoDia }
        });

        for (const agendamento of agendamentosExistentes) {
            const existenteInicioMinutos = converterHorarioParaMinutos(agendamento.horario);
            if (existenteInicioMinutos === -1) continue;
            const existenteFimMinutos = existenteInicioMinutos + DURACAO_SLOT_EM_MINUTOS;

            if (novoInicioMinutos < existenteFimMinutos && novoFimMinutos > existenteInicioMinutos)
                return res.status(409).json({
                    error: `Horário indisponível. Já existe uma reserva às ${agendamento.horario} neste laboratório.`
                });
        }

        const novoAgendamento = new Agendamento({
            laboratorio,
            data: inicioDoDia,
            horario,
            ...restoDoBody
        });

        await novoAgendamento.save();

        const estoque = await Estoque.findOne();
        if (!estoque)
            return res.status(500).json({ error: "Estoque não encontrado." });

        function atualizarEstoque(itens, tipo) {
            if (!itens || !Array.isArray(itens)) return;
            if (!estoque[tipo]) throw new Error(`Tipo de estoque '${tipo}' inválido.`);
            for (const i of itens) {
                const itemEstoque = estoque[tipo].find(e => e.nome.toLowerCase() === i.nome.toLowerCase());
                if (!itemEstoque) throw new Error(`Item '${i.nome}' (${tipo}) não encontrado no estoque.`);
                if (itemEstoque.quantidade < i.quantidade)
                    throw new Error(`Quantidade insuficiente de ${i.nome} (${tipo}).`);
                itemEstoque.quantidade -= i.quantidade;
            }
        }

        try {
            atualizarEstoque(restoDoBody.reagentes, "reagentes");
            atualizarEstoque(restoDoBody.vidrarias, "vidrarias");
            atualizarEstoque(restoDoBody.materiais, "materiais");

            estoque.atualizadoEm = new Date();
            await estoque.save();
        } catch (erroEstoque) {
            await Agendamento.findByIdAndDelete(novoAgendamento._id);
            return res.status(400).json({ error: erroEstoque.message });
        }

        res.status(201).json({ message: "✅ Agendamento criado e estoque atualizado!" });

    } catch (err) {
        console.error("Erro ao criar agendamento:", err);
        res.status(500).json({ error: "Erro interno ao criar agendamento: " + err.message });
    }
};

// --- Listar Agendamentos ---
exports.getAgendamentos = async (req, res) => {
    try {
        const agendamentos = await Agendamento.find({})
            .sort({ data: -1, horario: -1 })
            .populate("usuario", "login nome funcao");
        res.status(200).json(agendamentos);
    } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        res.status(500).json({ error: "Erro ao buscar agendamentos." });
    }
};

// =====================================
// Excluir Agendamento
// =====================================
exports.deleteAgendamento = async (req, res) => {
    try {
        const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
        if (!agendamento)
            return res.status(404).json({ error: "Agendamento não encontrado." });

        const estoque = await Estoque.findOne();
        if (estoque && agendamento) {
            function devolverEstoque(itens, tipo) {
                if (!itens || !Array.isArray(itens)) return;
                if (!estoque[tipo]) return;

                for (const i of itens) {
                    let item = estoque[tipo].find(e => e.nome.toLowerCase() === i.nome.toLowerCase());
                    if (item) item.quantidade += i.quantidade;
                    else estoque[tipo].push({ nome: i.nome, quantidade: i.quantidade, unidade: i.unidade || "" });
                }
            }

            devolverEstoque(agendamento.reagentes, "reagentes");
            devolverEstoque(agendamento.vidrarias, "vidrarias");
            devolverEstoque(agendamento.materiais, "materiais");

            estoque.atualizadoEm = new Date();
            await estoque.save();
        }

        res.status(200).json({ message: "✅ Agendamento excluído e estoque restaurado!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao excluir agendamento: " + err.message });
    }
};