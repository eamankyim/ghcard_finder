"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
exports.publicRouter = (0, express_1.Router)();
// Helpers
function maskId(fullId) {
    if (fullId.length <= 4)
        return '****';
    return `${'*'.repeat(Math.max(0, fullId.length - 4))}${fullId.slice(-4)}`;
}
function sanitizeCard(card) {
    return {
        id: card.id,
        cardType: card.cardType,
        maskedPublicId: card.maskedPublicId || maskId(card.fullId),
        firstNameInitial: card.firstName?.[0] || '',
        lastName: card.lastName,
        dobYear: new Date(card.dob).getFullYear(),
        imageUrl: card.imageUrl || null,
        holdingLocation: card.holdingLocation ? {
            id: card.holdingLocation.id,
            name: card.holdingLocation.name,
            address: card.holdingLocation.address,
            region: card.holdingLocation.region,
            phone: card.holdingLocation.phone,
            hours: card.holdingLocation.hours,
        } : null,
        status: card.status,
    };
}
// Search by ID
exports.publicRouter.get('/search/by-id', async (req, res) => {
    const schema = zod_1.z.object({
        idNumber: zod_1.z.string().min(3),
        cardType: zod_1.z.nativeEnum(client_1.CardType),
    });
    const parse = schema.safeParse(req.query);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { idNumber, cardType } = parse.data;
    const cards = await prisma.card.findMany({
        where: {
            cardType,
            status: client_1.CardStatus.AVAILABLE,
            OR: [
                { fullId: idNumber },
                { maskedPublicId: { contains: idNumber } },
            ],
        },
        include: { holdingLocation: true },
        take: 10,
    });
    res.json(cards.map(sanitizeCard));
});
// Search by name + DOB (month/year)
exports.publicRouter.get('/search/by-person', async (req, res) => {
    const schema = zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        dobYear: zod_1.z.coerce.number().int().gte(1900).lte(new Date().getFullYear()),
        dobMonth: zod_1.z.coerce.number().int().gte(1).lte(12).optional(),
    });
    const parse = schema.safeParse(req.query);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { firstName, lastName, dobYear, dobMonth } = parse.data;
    const start = new Date(dobYear, (dobMonth ?? 1) - 1, 1);
    const end = new Date(dobYear, (dobMonth ?? 12) - 1, 31, 23, 59, 59, 999);
    const cards = await prisma.card.findMany({
        where: {
            status: client_1.CardStatus.AVAILABLE,
            lastName: { contains: lastName },
            firstName: { startsWith: firstName },
            dob: { gte: start, lte: end },
        },
        include: { holdingLocation: true },
        take: 25,
    });
    res.json(cards.map(sanitizeCard));
});
// Create claim request
exports.publicRouter.post('/claims', async (req, res) => {
    const schema = zod_1.z.object({
        cardId: zod_1.z.string(),
        contactEmail: zod_1.z.string().email().optional(),
        contactPhone: zod_1.z.string().min(7).optional(),
    }).refine((d) => d.contactEmail || d.contactPhone, { message: 'Provide email or phone' });
    const parse = schema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: parse.error.flatten() });
    const { cardId, contactEmail, contactPhone } = parse.data;
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card || card.status !== client_1.CardStatus.AVAILABLE) {
        return res.status(404).json({ error: 'Card not available' });
    }
    const referenceCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const claim = await prisma.claim.create({
        data: {
            cardId,
            contactEmail,
            contactPhone,
            referenceCode,
            otpCode,
            otpExpiresAt,
            status: client_1.ClaimStatus.PENDING,
        },
    });
    // TODO: integrate SMS/Email providers
    res.status(201).json({ id: claim.id, referenceCode, otpSent: Boolean(otpCode) });
});
