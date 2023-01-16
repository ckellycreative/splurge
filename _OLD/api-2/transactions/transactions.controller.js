const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
 const transactionService = require('./transaction.service');

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(), create);
router.put('/:id', authorize(), update);
router.delete('/:id', authorize(), _delete);

module.exports = router;

function getAll(req, res, next) {
    transactionService.getAll()
        .then(transactions => res.json(transactions))
        .catch(next);
}

function getById(req, res, next) {

    transactionService.getById(req.params.id)
        .then(
            transaction => {
                if (!transaction) {
                    return res.sendStatus(404)
                }
                // users can get their own transaction and admins can get any transaction
                if (req.user.id !== transaction.userId && req.user.role !== Role.Admin){
                    return res.status(401).json({ message: 'Unauthorized' });
                }
                res.json(transaction) 
            })
        .catch(next);
}


function create(req, res, next) {
    // add userId to the new transaction
    req.body.userId = req.user.id;
    transactionService.create(req.body)
        .then(transaction => res.json(transaction))
        .catch(next);
}

function update(req, res, next) {
    transactionService.getById(req.params.id)
        .then(
            transaction => {
                if (!transaction) {
                    return res.sendStatus(404)
                }
                // users can get their own transaction and admins can get any transaction
                if (req.user.id !== transaction.userId && req.user.role !== Role.Admin){
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                transactionService.update(req.params.id, req.body)
                    .then(transaction => res.json(transaction))
                    .catch(next);
                })
        .catch(next);
}


function _delete(req, res, next) {
    transactionService.getById(req.params.id)
        .then(
            transaction => {
                if (!transaction) {
                    return res.sendStatus(404)
                }
                // users can delete their own transaction and admins can delete any transaction
                if (req.user.id !== transaction.userId && req.user.role !== Role.Admin){
                    return res.status(401).json({ message: 'Unauthorized' });
                }

                transactionService.delete(req.params.id)
                    .then(() => res.json({ message: 'Transaction deleted successfully' }))
                    .catch(next);
                })
}