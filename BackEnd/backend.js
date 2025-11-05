require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const Usuario = require("./models/Usuarios.js");
const Agendamento = require("./models/Agendamento.js");
const Kit = require("./models/Kit.js");
const { Item } = require("./models/Item.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Conexão com MongoDB Atlas ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch(err => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

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

// --- CRUD de usuários ---
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

// --- Agendamentos ---
app.post("/agendamentos", async (req, res) => {
  try {
    const agendamento = new Agendamento(req.body);
    await agendamento.save();
    res.status(201).json({ message: "Agendamento criado com sucesso!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -- get Agendamento --
app.get("/agendamentos", async (req, res) => {
  try {
    const agora = new Date();

    // Combina data e horário em um Date completo
    const agendamentos = await Agendamento.find()
      .sort({ data: -1 })
      .populate("usuario", "login nome funcao");

    const filtrados = agendamentos.filter(a => {
      if (!a.data || !a.horario) return false;
      const [hora, minuto] = a.horario.split(":").map(Number);
      const dataHora = new Date(a.data);
      dataHora.setHours(hora, minuto, 0, 0);
      return dataHora >= agora;
    });

    res.json(filtrados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/agendamentos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const agendamento = await Agendamento.findByIdAndDelete(id);

    if (!agendamento) {
      return res.status(404).json({ error: "Agendamento não encontrado." });
    }

    res.status(200).json({ message: "✅ Agendamento excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir agendamento:", err);
    res.status(500).json({ error: "Erro ao excluir agendamento." });
  }
});
app.patch("/agendamentos/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Status obrigatório" })

    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!agendamento) return res.status(404).json({ error: "Agendamento não encontrado" })

    res.json({ message: "Status atualizado com sucesso", agendamento });
  } catch (err) {
    console.log("Erro ao atualizar status", err);
    res.status(500).json({ error: "Erro ao atualizar o status"})
  }
})

// --- KITS ---
app.post("/kits", async (req, res) => {
  try {
    console.log("🟢 Recebido no body:", req.body);

    // garante que o body chegou
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Body da requisição está vazio." });
    }

    const { nomeKit, materiais = [], equipamentos = [], observacoes = "" } = req.body;

    if (!nomeKit)
      return res.status(400).json({ error: "O campo 'nomeKit' é obrigatório." });

    const novoKit = new Kit({ nomeKit, materiais, equipamentos, observacoes });
    await novoKit.save();

    res.status(201).json({ message: "✅ Kit criado com sucesso!", kit: novoKit });
  } catch (err) {
    console.error("Erro ao criar kit:", err);
    res.status(500).json({ error: "Erro ao criar kit." });
  }
});

app.get("/kits", async (req, res) => {
  try {
    const kits = await Kit.find();
    res.json(kits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/kits/:id", async (req, res) => {
  try {
    await Kit.findByIdAndDelete(req.params.id);
    res.json({ message: "Kit excluído com sucesso!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Busca de Kits

app.get("/kits/search/:termo", async (req, res) => {
  try {
    const termo = req.params.termo.trim();
    const regex = new RegExp(termo, "i"); // 'i' para ignorar maiúsculas/minúsculas

    const kits = await Kit.find({
      $or: [
        { nomeKit: regex },
        { "materiais.item": regex },
        { "equipamentos.item": regex },
        { observacoes: regex },
        { status: regex }
      ]
    });

    res.json(kits);
  } catch (err) {
    console.error("Erro na busca:", err);
    res.status(500).json({ error: "Erro ao buscar kits." });
  }
});

// --- Atualizar status do agendamento (Aceitar solicitação)
app.put("/agendamentos/:id", async (req, res) => {
  try {
    const agendamento = await Agendamento.findByIdAndUpdate(
      req.params.id,
      { status: "autorizado" },
      { new: true }
    );

    if (!agendamento)
      return res.status(404).json({ error: "Agendamento não encontrado." });

    res.json({ message: "✅ Agendamento autorizado com sucesso!", agendamento });
  } catch (err) {
    console.error("Erro ao autorizar agendamento:", err);
    res.status(500).json({ error: "Erro ao autorizar agendamento." });
  }
});


// --- Cadastro de Itens ---
app.post("/itens", async (req, res) => {
  try {
    const { item, tipo, quantidade, descricao } = req.body;

    if (!item || !tipo)
      return res.status(400).json({ error: "Campos obrigatórios: item e tipo." });

    const material = new Item({ item, tipo, quantidade, descricao });
    const respMongo = await material.save();
    console.log("🧾 Item salvo:", respMongo);

    res.status(201).json({ message: "✅ Item cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro ao salvar item:", err);
    res.status(500).json({ error: "Erro ao cadastrar item." });
  }
});

// --- Servidor ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

