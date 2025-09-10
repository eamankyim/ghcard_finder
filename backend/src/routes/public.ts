import { Router } from 'express';
import { PrismaClient, CardStatus, ClaimStatus, CardType } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
export const publicRouter = Router();

// Helpers
function maskId(fullId: string): string {
  if (fullId.length <= 4) return '****';
  return `${'*'.repeat(Math.max(0, fullId.length - 4))}${fullId.slice(-4)}`;
}

function sanitizeCard(card: any) {
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
publicRouter.get('/search/by-id', async (req, res) => {
  const schema = z.object({
    idNumber: z.string().min(3),
    cardType: z.nativeEnum(CardType),
  });
  const parse = schema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { idNumber, cardType } = parse.data;
  const cards = await prisma.card.findMany({
    where: {
      cardType,
      status: CardStatus.AVAILABLE,
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
publicRouter.get('/search/by-person', async (req, res) => {
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dobYear: z.coerce.number().int().gte(1900).lte(new Date().getFullYear()),
    dobMonth: z.coerce.number().int().gte(1).lte(12).optional(),
  });
  const parse = schema.safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { firstName, lastName, dobYear, dobMonth } = parse.data;

  const start = new Date(dobYear, (dobMonth ?? 1) - 1, 1);
  const end = new Date(dobYear, (dobMonth ?? 12) - 1, 31, 23, 59, 59, 999);

  const cards = await prisma.card.findMany({
    where: {
      status: CardStatus.AVAILABLE,
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
publicRouter.post('/claims', async (req, res) => {
  const schema = z.object({
    cardId: z.string(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().min(7).optional(),
  }).refine((d) => d.contactEmail || d.contactPhone, { message: 'Provide email or phone' });

  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { cardId, contactEmail, contactPhone } = parse.data;

  const card = await prisma.card.findUnique({ where: { id: cardId } });
  if (!card || card.status !== CardStatus.AVAILABLE) {
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
      status: ClaimStatus.PENDING,
    },
  });

  // TODO: integrate SMS/Email providers
  res.status(201).json({ id: claim.id, referenceCode, otpSent: Boolean(otpCode) });
});


