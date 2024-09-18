const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require("path");

const ca = fs.readFileSync('certificates/ca-certificate.crt');

const sequelize = new Sequelize(process.env.DB_CONN_STRING, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: true,
            ca: ca,
        }
    }
}
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

module.exports = sequelize;
