const mongoose = require("mongoose");

//==========================
// Conexão com o banco de dados MongoDB atlas
//==========================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log("✅ Conectado ao MongoDB Atlas");
    } catch (err) {
        console.error("❌ Erro ao conectar ao MongoDB:", err);
        process.exit(1);
    }
};

module.exports = connectDB;