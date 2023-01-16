const config = require('config.json');
const { Sequelize } = require('sequelize');

const { user, password, database } = config.database;
const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

module.exports = sequelize;