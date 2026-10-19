import { Sequelize } from "sequelize";
import connection from "../database/dabase-config.js";

const Notificacoes = connection.define('notificacoes', {
    id_notificacao: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    id_animal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'animais',
            key: 'id_animal'
        }
    },
    id_medicao: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'medicoes',
            key: 'id_medicao'
        }
    },
    perigo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    }
});

export default Notificacoes;