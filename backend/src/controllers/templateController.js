"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const db_1 = __importDefault(require("../db"));
const getTemplates = async (req, res) => {
    try {
        const templates = await db_1.default.producttemplate.findMany({
            orderBy: { template_name: 'asc' }
        });
        res.json(templates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
};
exports.getTemplates = getTemplates;
const createTemplate = async (req, res) => {
    try {
        const template = await db_1.default.producttemplate.create({
            data: req.body
        });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create template' });
    }
};
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => {
    try {
        const template = await db_1.default.producttemplate.update({
            where: { id: parseInt(req.params.id, 10) },
            data: req.body
        });
        res.json(template);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update template' });
    }
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => {
    try {
        await db_1.default.producttemplate.delete({
            where: { id: parseInt(req.params.id, 10) }
        });
        res.json({ message: 'Deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
};
exports.deleteTemplate = deleteTemplate;
