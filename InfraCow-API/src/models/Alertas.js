import { Sequelize } from "sequelize";
import connection from "../database/dabase-config.js";
import Medicoes from "./Medicoes.js";

const Alertas = connection.define('alertas', {
    id_alertas: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    perigos: {
        type: Sequelize.STRING,
        allowNull: false
    },
    anotacoes: {
        type: Sequelize.STRING,
        allowNull: false
    },
    id_animal: {
        type: Sequelize.INTEGER,
        references: {
            model: 'animais',
            key: 'id_animal'
        }
    },
    id_medicao: {
        type: Sequelize.INTEGER,
        references: {
            model: 'medicoes',
            key: 'id_medicao'
        }
    }

})

export default Alertas;