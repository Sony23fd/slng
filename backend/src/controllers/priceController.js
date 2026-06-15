"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPrice = exports.updatePrice = exports.getPrices = void 0;
const db_1 = __importDefault(require("../db"));
const getPrices = async (req, res) => {
    try {
        const prices = await db_1.default.masterprice.findMany();
        res.json(prices);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
};
exports.getPrices = getPrices;
const updatePrice = async (req, res) => {
    const { id } = req.params;
    const { unit_cost } = req.body;
    const userId = req.user?.id; // from auth middleware
    try {
        const priceId = parseInt(id);
        const oldPrice = await db_1.default.masterprice.findUnique({ where: { id: priceId } });
        if (!oldPrice) {
            return res.status(404).json({ error: 'Price not found' });
        }
        const result = await db_1.default.$transaction([
            db_1.default.masterprice.update({
                where: { id: priceId },
                data: { unit_cost }
            }),
            db_1.default.masterpricelog.create({
                data: {
                    masterPriceId: priceId,
                    changed_by: userId,
                    old_cost: oldPrice.unit_cost,
                    new_cost: unit_cost
                }
            })
        ]);
        res.json({ message: 'Price updated successfully', price: result[0] });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update price' });
    }
};
exports.updatePrice = updatePrice;
const createPrice = async (req, res) => {
    const { category, item_name, unit_cost } = req.body;
    const userId = req.user?.id;
    try {
        const price = await db_1.default.masterprice.create({
            data: {
                category,
                item_name,
                unit_cost: Number(unit_cost)
            }
        });
        // Create an initial log
        await db_1.default.masterpricelog.create({
            data: {
                masterPriceId: price.id,
                changed_by: userId,
                old_cost: 0,
                new_cost: price.unit_cost
            }
        });
        res.json(price);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create price' });
    }
};
exports.createPrice = createPrice;
