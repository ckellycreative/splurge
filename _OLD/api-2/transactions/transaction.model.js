const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        transaction_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        transaction_description: { type: DataTypes.STRING, allowNull: true },
        debit: { type: DataTypes.FLOAT(2), defaultValue: '0.00', allowNull: false },
        credit: { type: DataTypes.FLOAT(2), defaultValue: '0.00', allowNull: false },
        account_id: { type: DataTypes.INTEGER, allowNull: false },
        category_id: { type: DataTypes.INTEGER, allowNull: false },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
    };

    return sequelize.define('transaction', attributes);
}