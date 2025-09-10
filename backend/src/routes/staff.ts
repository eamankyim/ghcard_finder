import { Router } from 'express';
import { PrismaClient, CardType, CardStatus, ClaimStatus } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();
export const staffRouter = Router();

// Auth routes
staffRouter.post('/auth/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
  
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() }
  });

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Card management
staffRouter.get('/cards', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { page = 1, limit = 20, status, cardType } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;
  if (cardType) where.cardType = cardType;

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

staffRouter.post('/cards', authenticateToken, requireRole('INTAKE_OFFICER'), async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    cardType: z.nativeEnum(CardType),
    fullId: z.string().min(3),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.string().transform(str => new Date(str)),
    gender: z.string().optional(),
    imageUrl: z.string().url().optional(),
    holdingLocationId: z.string(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const data = parse.data;
  const maskedPublicId = data.fullId.length <= 4 ? '****' : 
    `${'*'.repeat(Math.max(0, data.fullId.length - 4))}${data.fullId.slice(-4)}`;

  try {
    const card = await prisma.card.create({
      data: {
        ...data,
        maskedPublicId,
        status: CardStatus.AVAILABLE,
      },
      include: { holdingLocation: true }
    });
    res.status(201).json(card);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Card with this ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create card' });
    }
  }
});

staffRouter.patch('/cards/:id', authenticateToken, requireRole('INTAKE_OFFICER'), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const schema = z.object({
    status: z.nativeEnum(CardStatus).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    dob: z.string().transform(str => new Date(str)).optional(),
    gender: z.string().optional(),
    imageUrl: z.string().url().optional(),
    holdingLocationId: z.string().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const updateData = parse.data;
  if (updateData.status === CardStatus.CLAIMED) {
    (updateData as any).claimedAt = new Date();
  }

  try {
    const card = await prisma.card.update({
      where: { id },
      data: updateData,
      include: { holdingLocation: true }
    });
    res.json(card);
  } catch (error) {
    res.status(404).json({ error: 'Card not found' });
  }
});

// Location management
staffRouter.get('/locations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  });
  res.json(locations);
});

staffRouter.post('/locations', authenticateToken, requireRole('ADMIN'), async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    region: z.string().min(1),
    phone: z.string().optional(),
    hours: z.string().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const location = await prisma.location.create({
    data: parse.data
  });
  res.status(201).json(location);
});

// Claims management
staffRouter.get('/claims', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = status;

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

staffRouter.patch('/claims/:id', authenticateToken, requireRole('INTAKE_OFFICER'), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const schema = z.object({
    status: z.nativeEnum(ClaimStatus),
    notes: z.string().optional(),
  });
  const parse = schema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { status, notes } = parse.data;
  const updateData: any = { status, notes };
  
  if (status === ClaimStatus.COLLECTED) {
    updateData.handledById = req.user!.id;
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
    if (status === ClaimStatus.COLLECTED) {
      await prisma.card.update({
        where: { id: claim.cardId },
        data: { 
          status: CardStatus.CLAIMED,
          claimedAt: new Date()
        }
      });
    }

    res.json(claim);
  } catch (error) {
    res.status(404).json({ error: 'Claim not found' });
  }
});
