import { Sequelize } from "sequelize";
import connection from "../database/dabase-config.js";
import Animais from "./Animais.js";

const Medicoes = connection.define('medicoes', {
    id_medicao: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    temp: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    datahora: {
        type: Sequelize.DATE, 
        allowNull: false
    },
    id_animal: {
        type: Sequelize.INTEGER,
        references: {
            model: 'animais',
            key: 'id_animal'
        }
    }

})

export default Medicoes;