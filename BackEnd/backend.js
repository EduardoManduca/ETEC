require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Models
const Usuario = require("./models/Usuarios.js");
const Agendamento = require("./models/Agendamento.js");
const Kit = require("./models/Kit.js");
const { Item } = require("./models/Item.js")

const app = express();
app.use(cors());
app.use(express.json());

// --- Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("<✅> Conectado ao MongoDB"))
  .catch(err => {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
    process.exit(1);
  });

// --- Rota principal
app.get("/", (req, res) => res.send("Servidor online!"));

// --- Cadastro de usuário
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

// --- Login
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

// --- CRUD de usuários
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

// --- Agendamentos
app.post("/agendamentos", async (req, res) => {
  try {
    const agendamento = new Agendamento(req.body);
    await agendamento.save();
    res.status(201).json({ message: "Agendamento criado com sucesso!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/agendamentos", async (req, res) => {
  try {
    const agendamentos = await Agendamento.find();
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Kits
app.post("/kits", async (req, res) => {
  try {
    const { nomeKit, materiais, equipamentos, observacoes } = req.body;

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

// Cadastro de Materiais
app.post("/itens", async (req, res) => {
  try {
    const item = req.body.item;
    const tipo = req.body.tipo;
    const quantidade = req.body.quantidade;
    const descricao = req.body.descricao;
    
    const material = new Item({
      item: item, 
      tipo: tipo,
      quantidade: quantidade,
      descricao: descricao
    });
    const respMongo = await material.save();
    console.log(respMongo);

    res.status(201).end();
    
    
  } catch (err) {
    console.log("Erro:", err);
    res.status(409).end()
  }
});

app.get("/itens", async (req, res) => {
  const itens = await Item.find();
  res.json(itens);
});

// --- Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`<✅> Servidor rodando na porta ${PORT}`));
