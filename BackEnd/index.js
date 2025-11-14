require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Importar rotas
const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const agendamentoRoutes = require("./routes/agendamentoRoutes");
const kitRoutes = require("./routes/kitRoutes");
const estoqueRoutes = require("./routes/estoqueRoutes");
const historicoRoutes = require("./routes/historicoRoutes");

// Conectar ao banco de dados
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Rota principal ---
app.get("/", (req, res) => res.send("Servidor online!"));

// --- Usar rotas ---
// Deixei os prefixos de rota aqui para manter os caminhos originais
app.use("/", authRoutes); // Contém /signup e /login
app.use("/usuarios", usuarioRoutes);
app.use("/agendamentos", agendamentoRoutes);
app.use("/kits", kitRoutes);
app.use("/estoque", estoqueRoutes);
app.use("/historico-materiais", historicoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));