require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Usuario = require("./models/Usuarios.js"); // exportação do arquivo usuario.js
const Agendamento = require("./models/Agendamento.js") // exportação do arquivo Agendamento.js
const Kit = require("./models/Kit.js") // exportação do arquivo Kits.js

const app = express();
app.use(cors());
app.use(express.json());

async function conectarMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("<✅> Conectado ao MongoDB");
  } catch (erro) {
    console.error("❌ Erro ao conectar ao Mongo:", erro);
    process.exit(1);
  }
}

conectarMongoDB();

// --- Rota principal
app.get("/", (req, res) => res.send("Servidor online!"));

// --- Cadastro
app.post("/signup", async (req, res) => {
  try {
    const { login, password, funcao } = req.body;
    if (!login || !password || !funcao) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const usuarioExistente = await Usuario.findOne({ login });
    if (usuarioExistente) {
      return res.status(409).json({
        error: `⚠️ Já existe um usuário com o nome ${usuarioExistente.login}`
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const novoUsuario = new Usuario({ login, password: passwordHash, funcao });
    await novoUsuario.save();

    res.status(201).json({ message: "✅ Usuário criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar usuário." });
  }
});

// --- Login
app.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ login });
    if (!usuario) return res.status(401).json({ error: "Usuário não encontrado" });

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) return res.status(401).json({ error: "Senha incorreta" });

    // Aqui está o essencial
    res.json({
      message: "Login bem-sucedido",
      usuario: {
        _id: usuario._id.toString(),
        funcao: usuario.funcao
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`<✅> Servidor rodando na porta ${PORT}`));

// Agendamento de laboratório

app.post("/agendamentos", async (req, res) => {
  console.log("Recebido:", req.body); // verifique exatamente o que chega
  try {
    const agendamento = new Agendamento(req.body);
    await agendamento.save();
    res.status(201).json({ message: "Agendamento criado com sucesso!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// rota para listar agendamentos (só pra testar)
app.get("/agendamentos", async (req, res) => {
  const agendamentos = await Agendamento.find();
  res.json(agendamentos);
});

//criação de kit,
app.post("/kits", async (req, res) => {
  console.log("Recebido:", req.body);
  const kit = new Kit(req.body);
  try {
    await kit.save();
    res.status(201).json({ message: "Kit criado com sucesso!", kit });
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});
