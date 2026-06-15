"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomers = void 0;
const db_1 = __importDefault(require("../db"));
const getCustomers = async (req, res) => {
    try {
        const customers = await db_1.default.customer.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};
exports.getCustomers = getCustomers;
const createCustomer = async (req, res) => {
    try {
        const customer = await db_1.default.customer.create({
            data: req.body
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create customer' });
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    try {
        const customer = await db_1.default.customer.update({
            where: { id: parseInt(req.params.id, 10) },
            data: req.body
        });
        res.json(customer);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update customer' });
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    try {
        await db_1.default.customer.delete({
            where: { id: parseInt(req.params.id, 10) }
        });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete customer' });
    }
};
exports.deleteCustomer = deleteCustomer;
