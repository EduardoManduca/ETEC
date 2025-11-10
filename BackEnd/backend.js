require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Usuario = require("./models/Usuarios.js");
const Agendamento = require("./models/Agendamento.js");
const Kit = require("./models/Kit.js");
const Estoque = require("./models/Estoque.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function iniciarServidor() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado ao MongoDB Atlas");

    // --- Rota principal ---
    app.get("/", (req, res) => res.send("Servidor online!"));

    // --- Cadastro de usuário ---
    app.post("/signup", async (req, res) => {
      try {
        const { login, password, funcao } = req.body;
        if (!login || !password || !funcao)
          return res.status(400).json({ error: "Todos os campos são obrigatórios." });

        const existente = await Usuario.findOne({ login });
        if (existente)
          return res.status(409).json({ error: "Usuário já existe!" });

        const passwordHash = await bcrypt.hash(password, 10);
        const novoUsuario = new Usuario({ login, password: passwordHash, funcao });
        await novoUsuario.save();

        res.status(201).json({ message: "✅ Usuário cadastrado com sucesso!" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao criar usuário." });
      }
    });

    // --- Login ---
    app.post("/login", async (req, res) => {
      try {
        const { login, password } = req.body;
        const usuario = await Usuario.findOne({ login });
        if (!usuario)
          return res.status(401).json({ error: "Usuário não encontrado" });

        const senhaValida = await bcrypt.compare(password, usuario.password);
        if (!senhaValida)
          return res.status(401).json({ error: "Senha incorreta" });

        res.json({
          message: "Login bem-sucedido",
          usuario: { _id: usuario._id.toString(), funcao: usuario.funcao }
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    });

    //=============================
    // CRUD de usuários 
    //=============================

    app.get("/usuarios", async (req, res) => {
      try {
        const usuarios = await Usuario.find({}, "-password");
        res.json(usuarios);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.put("/usuarios/:id", async (req, res) => {
      try {
        const { login, password, funcao } = req.body;
        const updateData = { login, funcao };

        if (password)
          updateData.password = await bcrypt.hash(password, 10);

        const usuarioAtualizado = await Usuario.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true }
        );

        res.json(usuarioAtualizado);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    app.delete("/usuarios/:id", async (req, res) => {
      try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ message: "Usuário excluído com sucesso!" });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    });

    //=============================
    // AGENDAMENTOS
    //=============================

    function converterHorarioParaMinutos(horarioStr) {
      try {
        if (!horarioStr || typeof horarioStr !== "string" || !horarioStr.includes(":")) {
          throw new Error("Formato de horário inválido ou nulo");
        }
        const [horas, minutos] = horarioStr.split(":").map(Number);
        if (isNaN(horas) || isNaN(minutos)) {
          throw new Error("Componentes do horário não são números");
        }
        return horas * 60 + minutos;
      } catch (e) {
        console.warn(`Aviso: Falha ao converter horário "${horarioStr}". ${e.message}`);
        return -1;
      }
    }

    app.post("/agendamentos", async (req, res) => {
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
          // Verifica se o tipo existe no estoque (ex: 'vidrarias')
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
    });

    app.get("/agendamentos", async (req, res) => {
      try {
        const agendamentos = await Agendamento.find({})
          .sort({ data: -1, horario: -1 })
          .populate("usuario", "login nome funcao");
        res.status(200).json(agendamentos);
      } catch (err) {
        console.error("Erro ao buscar agendamentos:", err);
        res.status(500).json({ error: "Erro ao buscar agendamentos." });
      }
    });

    app.delete("/agendamentos/:id", async (req, res) => {
      try {
        const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
        if (!agendamento)
          return res.status(404).json({ error: "Agendamento não encontrado." });

        const estoque = await Estoque.findOne();
        if (estoque && agendamento) {
          function devolverEstoque(itens, tipo) {
            if (!itens || !Array.isArray(itens)) return;
            // Verifica se o tipo existe no estoque
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
    });

    //=============================
    // KITS
    //=============================

    app.post("/kits", async (req, res) => {
      try {
        const {
          nomeKit,
          reagentes = [],
          vidrarias = [],
          materiais = [],
          observacoes = "",
          usuario // NOVO: Campo de usuário
        } = req.body;

        if (!nomeKit || nomeKit.trim() === "")
          return res.status(400).json({ error: "O campo 'nomeKit' é obrigatório." });

        if (!usuario)
          return res.status(400).json({ error: "ID do usuário é obrigatório." }); // Garante que o usuário está logado

        const reagentesValidos = reagentes
          .filter(i => i.nome && i.nome.trim() !== "" && i.quantidade > 0)
          .map(i => ({ nome: i.nome.trim(), quantidade: i.quantidade, unidade: i.unidade || "" }));

        // CORRIGIDO: Vidrarias Validas
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
          usuario // NOVO: Salva o ID do usuário
        });

        await novoKit.save();
        res.status(201).json({ message: "✅ Kit criado com sucesso!", kit: novoKit });
      } catch (err) {
        console.error("Erro ao criar kit:", err);
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/kits", async (req, res) => {
      try {
        const { apenasAutorizados } = req.query;
        const filtro = apenasAutorizados === "true" ? { status: "autorizado" } : {};
        // NOVO: Usa populate para trazer o login do usuário
        const kits = await Kit.find(filtro).populate("usuario", "login");
        res.json(kits);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.patch("/kits/:id/status", async (req, res) => {
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
    });

    app.delete("/kits/:id", async (req, res) => {
      try {
        const kit = await Kit.findById(req.params.id);
        if (!kit) return res.status(404).json({ error: "Kit não encontrado." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(500).json({ error: "Estoque não encontrado." });

        if (kit.status === "autorizado") {
          function devolverItens(itens, tipo) {
            if (!itens || !Array.isArray(itens)) return;
            // Verifica se o tipo existe
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
    });

    //=============================
    // ESTOQUE
    //=============================
    app.get("/estoque", async (req, res) => {
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
    });

    app.post("/estoque/:tipo", async (req, res) => {
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
    });

    app.patch("/estoque/:tipo/:nome", async (req, res) => {
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
    });

    app.delete("/estoque/:tipo/:nome", async (req, res) => {
      try {
        const { tipo, nome } = req.params;
        if (!["reagentes", "materiais", "vidrarias"].includes(tipo))
          return res.status(400).json({ error: "Tipo inválido." });

        const estoque = await Estoque.findOne();
        if (!estoque) return res.status(404).json({ error: "Estoque não encontrado." });

        // ==========================================================
        // Garante que o tipo exista no estoque antes de procurar
        // ==========================================================

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
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));

  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  }
}

// =============================
// HISTÓRICO DE MATERIAIS
// =============================

app.get("/historico-materiais", async (req, res) => {
  try {
    const kits = await Kit.find({ status: "autorizado" }).sort({ updatedAt: -1 });
    const historico = [];

    kits.forEach(kit => {
      const data = kit.updatedAt || kit.createdAt || new Date();

      const adicionarAoHistorico = (itens, tipo) => {
        if (!itens) return;
        itens.forEach(i => {
          historico.push({
            data,
            // CORRIGIDO: Tenta buscar o login se o populate falhar
            professor: kit.usuario && kit.usuario.login ? kit.usuario.login : "Não-Logado",
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
});

// =======================================
//  Apagar TODO o estoque
// =======================================
app.delete("/estoque", async (req, res) => {
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
});


iniciarServidor();