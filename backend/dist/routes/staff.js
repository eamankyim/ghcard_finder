"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const prisma = new client_1.PrismaClient();
exports.staffRouter = (0, express_1.Router)();
// Auth routes
exports.staffRouter.post('/auth/login', async (req, res) => {
    const schema = zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
    });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
// Card management
exports.staffRouter.get('/cards', auth_1.authenticateToken, async (req, res) => {
    const { page = 1, limit = 20, status, cardType } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status;
    if (cardType)
        where.cardType = cardType;
    const [cards, total] = await Promise.all([
        prisma.card.findMany({
            where,
            include: { holdingLocation: true, claims: true },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.card.count({ where })
    ]);
    res.json({ cards, total, page: Number(page), limit: Number(limit) });
});
exports.staffRouter.post('/cards', auth_1.authenticateToken, (0, auth_1.requireRole)('INTAKE_OFFICER'), async (req, res) => {
    const schema = zod_1.z.object({
        cardType: zod_1.z.nativeEnum(client_1.CardType),
        fullId: zod_1.z.string().min(3),
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        dob: zod_1.z.string().transform(str => new Date(str)),
        gender: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url().optional(),
        holdingLocationId: zod_1.z.string(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const data = parse.data;
    const maskedPublicId = data.fullId.length <= 4 ? '****' :
        `${'*'.repeat(Math.max(0, data.fullId.length - 4))}${data.fullId.slice(-4)}`;
    try {
        const card = await prisma.card.create({
            data: {
                ...data,
                maskedPublicId,
                status: client_1.CardStatus.AVAILABLE,
            },
            include: { holdingLocation: true }
        });
        res.status(201).json(card);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'Card with this ID already exists' });
        }
        else {
            res.status(500).json({ error: 'Failed to create card' });
        }
    }
});
exports.staffRouter.patch('/cards/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('INTAKE_OFFICER'), async (req, res) => {
    const { id } = req.params;
    const schema = zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.CardStatus).optional(),
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional(),
        dob: zod_1.z.string().transform(str => new Date(str)).optional(),
        gender: zod_1.z.string().optional(),
        imageUrl: zod_1.z.string().url().optional(),
        holdingLocationId: zod_1.z.string().optional(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const updateData = parse.data;
    if (updateData.status === client_1.CardStatus.CLAIMED) {
        updateData.claimedAt = new Date();
    }
    try {
        const card = await prisma.card.update({
            where: { id },
            data: updateData,
            include: { holdingLocation: true }
        });
        res.json(card);
    }
    catch (error) {
        res.status(404).json({ error: 'Card not found' });
    }
});
// Location management
exports.staffRouter.get('/locations', auth_1.authenticateToken, async (req, res) => {
    const locations = await prisma.location.findMany({
        orderBy: { name: 'asc' }
    });
    res.json(locations);
});
exports.staffRouter.post('/locations', auth_1.authenticateToken, (0, auth_1.requireRole)('ADMIN'), async (req, res) => {
    const schema = zod_1.z.object({
        name: zod_1.z.string().min(1),
        address: zod_1.z.string().min(1),
        region: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
        hours: zod_1.z.string().optional(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const location = await prisma.location.create({
        data: parse.data
    });
    res.status(201).json(location);
});
// Claims management
exports.staffRouter.get('/claims', auth_1.authenticateToken, async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    if (status)
        where.status = status;
    const [claims, total] = await Promise.all([
        prisma.claim.findMany({
            where,
            include: {
                card: { include: { holdingLocation: true } },
                handledBy: true
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.claim.count({ where })
    ]);
    res.json({ claims, total, page: Number(page), limit: Number(limit) });
});
exports.staffRouter.patch('/claims/:id', auth_1.authenticateToken, (0, auth_1.requireRole)('INTAKE_OFFICER'), async (req, res) => {
    const { id } = req.params;
    const schema = zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.ClaimStatus),
        notes: zod_1.z.string().optional(),
    });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { status, notes } = parse.data;
    const updateData = { status, notes };
    if (status === client_1.ClaimStatus.COLLECTED) {
        updateData.handledById = req.user.id;
    }
    try {
        const claim = await prisma.claim.update({
            where: { id },
            data: updateData,
            include: {
                card: { include: { holdingLocation: true } },
                handledBy: true
            }
        });
        // If claim is collected, mark card as claimed
        if (status === client_1.ClaimStatus.COLLECTED) {
            await prisma.card.update({
                where: { id: claim.cardId },
                data: {
                    status: client_1.CardStatus.CLAIMED,
                    claimedAt: new Date()
                }
            });
        }
        res.json(claim);
    }
    catch (error) {
        res.status(404).json({ error: 'Claim not found' });
    }
});
