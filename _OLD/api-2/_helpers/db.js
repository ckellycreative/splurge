const config = require('config.json');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

module.exports = db = {};

initialize();

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    // init models and add them to the exported db object
    db.Transaction = require('../transactions/transaction.model')(sequelize);
    db.User = require('../users/user.model')(sequelize);
    db.RefreshToken = require('../users/refresh-token.model')(sequelize);

    // define relationships
    db.User.hasMany(db.RefreshToken, { onDelete: 'CASCADE' });
    db.User.hasMany(db.Transaction, { onDelete: 'CASCADE' });
    db.RefreshToken.belongsTo(db.User);
    db.Transaction.belongsTo(db.User);

    // sync all models with database
    await sequelize.sync();
}