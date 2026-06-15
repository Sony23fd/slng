"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConstant = exports.deleteConstant = exports.createConstant = exports.getConstants = void 0;
const db_1 = __importDefault(require("../db"));
const getConstants = async (req, res) => {
    try {
        const constants = await db_1.default.constant.findMany();
        res.json(constants);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch constants' });
    }
};
exports.getConstants = getConstants;
const createConstant = async (req, res) => {
    const { type, value, description } = req.body;
    try {
        const constant = await db_1.default.constant.create({
            data: { type, value, description }
        });
        res.json(constant);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create constant' });
    }
};
exports.createConstant = createConstant;
const deleteConstant = async (req, res) => {
    const { id } = req.params;
    try {
        await db_1.default.constant.delete({ where: { id: parseInt(id) } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete constant' });
    }
};
exports.deleteConstant = deleteConstant;
const updateConstant = async (req, res) => {
    const { id } = req.params;
    const { type, value, description } = req.body;
    try {
        const updated = await db_1.default.constant.update({
            where: { id: parseInt(id) },
            data: { type, value, description }
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update constant' });
    }
};
exports.updateConstant = updateConstant;
