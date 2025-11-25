const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//==========================
// SCHEMA DE USUÁRIOS
//==========================
const UsuariosSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },                  // nome do usuário
    login: { type: String, required: true, unique: true, trim: true },   // login único do usuário
    password: { type: String, required: true },                          // senha do usuário
    funcao: { type: String, required: true, trim: true }                 // função/role do usuário
});

//==========================
// PLUGIN DE VALIDAÇÃO DE UNICIDADE
//==========================
UsuariosSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Usuario", UsuariosSchema);
