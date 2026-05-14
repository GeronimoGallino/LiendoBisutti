require('dotenv').config();
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // Mantener en false porque controlaremos las tablas con las migraciones
    logging: true,      // Te mostrará por consola qué queries SQL se están ejecutando
    migrations: ["./migrations/*.js"], // <-- Asegúrate de que la ruta coincida con la carpeta donde guardaste tu migración
});

module.exports = { AppDataSource };