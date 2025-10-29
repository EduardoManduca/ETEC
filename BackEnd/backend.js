require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Usuario = require("./models/Usuarios.js"); // exportação da pasta usuario.js

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
  try {
    const { login, password } = req.body;
    const usuario = await Usuario.findOne({ login });
    if (!usuario) return res.status(401).json({ error: "Usuário não encontrado." });

    const senhaCorreta = await bcrypt.compare(password, usuario.password);
    if (!senhaCorreta) return res.status(401).json({ error: "Senha incorreta." });

    res.status(200).json({ usuario: { login: usuario.login, funcao: usuario.funcao } });
  } catch (error) {
    res.status(500).json({ error: "Erro ao tentar logar." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`<✅> Servidor rodando na porta ${PORT}`));
