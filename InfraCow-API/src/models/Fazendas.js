import { Sequelize } from "sequelize";
import connection from "../database/dabase-config.js";

const Fazendas = connection.define('fazendas', {
    id_fazenda: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome_fazenda: {
        type: Sequelize.STRING,
        allowNull: false
    },
    rua: {
        type: Sequelize.STRING,
        allowNull: false
    },
    bairro: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cidade: {
        type: Sequelize.STRING,
        allowNull: false
    },
    CEP: {
        type: Sequelize.STRING,
        allowNull: false
    },
    numero: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        references: {
            model: 'usuarios',
            key: 'id_usuario'
        }
    },
    imagem: {
        type: Sequelize.STRING,
        allowNull: true,
    }

})
export default Fazendas;