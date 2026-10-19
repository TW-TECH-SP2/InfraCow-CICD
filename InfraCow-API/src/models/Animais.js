import { Sequelize } from "sequelize";
import connection from "../database/dabase-config.js";

const Animais = connection.define('animais', {
    id_animal: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome_animal: {
        type: Sequelize.STRING,
        allowNull: false
    },
    codigo: {
        type: Sequelize.STRING,
        allowNull: true
    },
    genero: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tipo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    raca: {
        type: Sequelize.STRING,
        allowNull: false
    },
    peso: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    idade: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    id_fazenda: {
        type: Sequelize.INTEGER,
        references: {
            model: 'fazendas',
            key: 'id_fazenda'
        }
    },
    imagem: {
        type: Sequelize.STRING,
        allowNull: true,
    }
})

export default Animais;