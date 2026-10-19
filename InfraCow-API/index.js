import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import path from "path";
import { fileURLToPath } from "url";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.resolve(__dirname, "uploads");

import connection from "./src/database/dabase-config.js";
import Usuarios from "./src/models/Usuarios.js";
import Fazendas from "./src/models/Fazendas.js";
import Animais from "./src/models/Animais.js";
import Alertas from "./src/models/Alertas.js"
import Medicoes from "./src/models/Medicoes.js";
import Notificacoes from "./src/models/Notificacoes.js";

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads", express.static(uploadsPath));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ========================================
// DEFINIR ASSOCIAÇÕES SEQUELIZE PRIMEIRO
// ========================================
Usuarios.hasMany(Fazendas, { foreignKey: 'id_usuario' });
Fazendas.belongsTo(Usuarios, { foreignKey: 'id_usuario' });

Fazendas.hasMany(Animais, { foreignKey: 'id_fazenda' });
Animais.belongsTo(Fazendas, { foreignKey: 'id_fazenda' });

Animais.hasMany(Medicoes, { foreignKey: 'id_animal' });
Medicoes.belongsTo(Animais, { foreignKey: 'id_animal' });

Medicoes.hasMany(Notificacoes, { foreignKey: 'id_medicao' });
Notificacoes.belongsTo(Medicoes, { foreignKey: 'id_medicao' });

Animais.hasMany(Notificacoes, { foreignKey: 'id_animal' });
Notificacoes.belongsTo(Animais, { foreignKey: 'id_animal' });

import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import fazendaRoutes from "./src/routes/fazendaRoutes.js";
import animalRoutes from "./src/routes/animalRoutes.js";
import medicoesRoutes from "./src/routes/medicoesRoutes.js";
import notificacaoRoutes from "./src/routes/notificacaoRoutes.js";

app.use("/", usuarioRoutes);
app.use("/", fazendaRoutes);
app.use("/", animalRoutes);
app.use("/", medicoesRoutes);
app.use("/", notificacaoRoutes);

// Definir associações Sequelize
Usuarios.hasMany(Fazendas, { foreignKey: 'id_usuario' });
Fazendas.belongsTo(Usuarios, { foreignKey: 'id_usuario' });

Fazendas.hasMany(Animais, { foreignKey: 'id_fazenda' });
Animais.belongsTo(Fazendas, { foreignKey: 'id_fazenda' });

Animais.hasMany(Medicoes, { foreignKey: 'id_animal' });
Medicoes.belongsTo(Animais, { foreignKey: 'id_animal' });

Medicoes.hasMany(Notificacoes, { foreignKey: 'id_medicao' });
Notificacoes.belongsTo(Medicoes, { foreignKey: 'id_medicao' });

Animais.hasMany(Notificacoes, { foreignKey: 'id_animal' });
Notificacoes.belongsTo(Animais, { foreignKey: 'id_animal' });

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const syncOptions = process.env.NODE_ENV === "production"
  ? {}
  : { alter: true };

connection.sync(syncOptions)
  .then(async () => {
    console.log("Banco sincronizado com sucesso!");
    
    // Migração: converter codigo de INTEGER para VARCHAR (RFID)
    try {
      await connection.query(`
        ALTER TABLE animais 
        ALTER COLUMN codigo TYPE VARCHAR(255) USING codigo::text;
      `);
      console.log("Coluna 'codigo' convertida para VARCHAR com sucesso!");
    } catch (error) {
      if (error.message && error.message.includes("already exists")) {
        console.log("Coluna 'codigo' já é VARCHAR, nada a fazer.");
      } else {
        console.warn("Aviso ao converter 'codigo':", error.message);
      }
    }
  })
  .catch((error) => console.error("Erro ao sincronizar banco: ", error));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
