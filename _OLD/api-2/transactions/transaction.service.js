const config = require('config.json');
const { Op } = require('sequelize');
const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};


async function getAll() {
    const transactions = await db.Transaction.findAll();
    return transactions.map(x => basicDetails(x));
}

async function getById(id) {
    const transaction = await getTransaction(id);
    return basicDetails(transaction);
}

async function create(params) {
    const transaction = new db.Transaction(params);
    // save transaction
    await transaction.save();

    return basicDetails(transaction);
}

async function update(id, params) {
    const transaction = await getTransaction(id);

    // copy params to transaction and save
    Object.assign(transaction, params);
    transaction.updated = Date.now();
    await transaction.save();

    return basicDetails(transaction);
}

async function _delete(id) {
    const transaction = await getTransaction(id);
    await transaction.destroy();
}

// helper functions

async function getTransaction(id) {
    const transaction = await db.Transaction.findByPk(id);
    if (!transaction) throw 'Transaction not found';
    return transaction;
}


function basicDetails(transaction) {
    const { id, userId, transaction_date, transaction_description, debit, credit, account_id, category_id } = transaction;
    return { id, userId, transaction_date, transaction_description, debit, credit, account_id, category_id };
}
