const config = require('config.json');
const { QueryTypes, Op, Sequelize } = require('sequelize');
const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};



async function getAll() {
    const plans = await db.Plan.findAll();
    return plans.map(x => basicDetails(x));
}

async function getById(id) {
    const plan = await getPlan(id);
    return basicDetails(plan);
}

async function create(params) {
    const plan = new db.Plan(params);    
    await plan.save();

    return basicDetails(plan);
}

async function update(id, params) {
    const plan = await getPlan(id);

    // copy params to plan and save
    Object.assign(plan, params);
    plan.updated = Date.now();
    await plan.save();
    return basicDetails(plan);
}



async function _delete(id) {
    const plan = await getPlan(id);
    await plan.destroy();
}



// helper functions

async function getPlan(id) {
    const plan = await db.Plan.findByPk(id);
    if (!plan) throw 'Plan not found';
    return plan;
}



function basicDetails(plan) {
    const { id, accountId, categoryId, planAmount, PlanCategory} = plan;
    return { id, accountId, categoryId, planAmount, PlanCategory };
}
