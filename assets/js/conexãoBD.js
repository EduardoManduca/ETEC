const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://TouchBrownn:o4WuFdR7J0HczfrB@etecmaua2025.ea6cnme.mongodb.net/"; 
const dbName = "meuProjetoDB"; 
const collectionName = "usuarios";
// --------------------

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Conectado com sucesso ao servidor MongoDB!");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    console.log("\nInserindo um documento...");
    const novoUsuario = {
      nome: "Sergio",
      idade: 18,
    };
    
    const insertResult = await collection.insertOne(novoUsuario);
    console.log(`Novo documento inserido com o _id: ${insertResult.insertedId}`);
    console.log("\nBuscando o documento...");

    const query = { nome: "Sergio" }; 
    const usuarioEncontrado = await collection.findOne(query);

    if (usuarioEncontrado) {
      console.log("Documento encontrado:");
      console.log(usuarioEncontrado);
    } else {
      console.log("Nenhum documento encontrado.");
    }

  } catch (err) {
    console.error("Ocorreu um erro:", err);
  } finally {
    await client.close();
    console.log("\nConexão fechada.");
  }
}
run();