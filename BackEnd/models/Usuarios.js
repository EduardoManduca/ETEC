const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const UsuariosSchema = new mongoose.Schema({
  login: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  funcao: { type: String, required: true, trim: true }
});

UsuariosSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Usuario", UsuariosSchema);
