import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'

dotenv.config();

const useDatabaseUrl = Boolean(process.env.DATABASE_URL);

const baseConfig = useDatabaseUrl
    ? process.env.DATABASE_URL
    : {
            dialect: 'postgres',
            host: process.env.DB_HOST,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: Number(process.env.DB_PORT || 5432),
        };

const connection = useDatabaseUrl
    ? new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            dialectOptions: {
                ssl: {
                    require: true,
                    rejectUnauthorized: false,
                },
            },
            logging: false,
        })
    : new Sequelize({
            ...baseConfig,
            logging: false,
            dialectOptions: process.env.DB_SSL === 'true'
                ? {
                        ssl: {
                            require: true,
                            rejectUnauthorized: false,
                        },
                    }
                : undefined,
        });

export default connection;