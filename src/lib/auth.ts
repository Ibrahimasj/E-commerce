import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'nusamart-secret-key-ecommerce-2026';
export const COOKIE_NAME = 'nusamart_token';
const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');

export interface JWTPayload {
  id: string;
  email: string;
  name?: string | null;
  role: 'customer' | 'admin';
}

// -------------------------------------------------------------
// 1. Password Helper (Bcrypt)
// -------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Dukung hash bcrypt ($2a$ atau $2b$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compare(password, hash);
  }
  // Fallback untuk akun demo seeded lokal
  return password === hash;
}

// -------------------------------------------------------------
// 2. JWT Helper (JsonWebToken)
// -------------------------------------------------------------

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// 3. User & Prisma Helpers
// -------------------------------------------------------------

async function loadProfileMap(): Promise<Map<string, any>> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    const map = new Map<string, any>();
    for (const u of parsed) {
      if (u.email) map.set(u.email.toLowerCase(), u);
      if (u.id) map.set(u.id, u);
    }
    return map;
  } catch {
    return new Map();
  }
}

export function toSafeUser(
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date | string;
  },
  profile?: any
): User {
  const normalizedRole: 'customer' | 'admin' =
    user.role.toLowerCase() === 'admin' ? 'admin' : 'customer';

  return {
    id: user.id,
    name: user.name || profile?.name || 'Pengguna NusaMart',
    email: user.email,
    role: normalizedRole,
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || 'Jakarta Selatan',
    postalCode: profile?.postalCode || '12340',
    createdAt:
      user.createdAt instanceof Date
        ? user.createdAt.toISOString()
        : user.createdAt || new Date().toISOString(),
  };
}

export async function findUserByEmail(email: string) {
  const search = email.trim().toLowerCase();
  return prisma.user.findUnique({
    where: { email: search },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByIdentifier(identifier: string) {
  const search = identifier.trim().toLowerCase();

  // 1. Cari berdasarkan email
  const byEmail = await prisma.user.findUnique({
    where: { email: search },
  });
  if (byEmail) return byEmail;

  // 2. Cari berdasarkan nama
  const allUsers = await prisma.user.findMany();
  const byName = allUsers.find(
    (u) => u.name && u.name.trim().toLowerCase() === search
  );
  if (byName) return byName;

  return null;
}

export async function getUserWithProfile(id: string): Promise<User | null> {
  const user = await findUserById(id);
  if (!user) return null;
  const profiles = await loadProfileMap();
  const profile = profiles.get(user.id) || profiles.get(user.email.toLowerCase());
  return toSafeUser(user, profile);
}

export async function getUserByIdentifierWithProfile(
  identifier: string
): Promise<{ user: any; safeUser: User } | null> {
  const user = await findUserByIdentifier(identifier);
  if (!user) return null;
  const profiles = await loadProfileMap();
  const profile = profiles.get(user.id) || profiles.get(user.email.toLowerCase());
  return {
    user,
    safeUser: toSafeUser(user, profile),
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}): Promise<User> {
  const email = data.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    throw new Error('Alamat email sudah terdaftar.');
  }

  const hashedPassword = await hashPassword(data.password);
  const role = (data.role || 'CUSTOMER').toUpperCase();

  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email,
      password: hashedPassword,
      role,
    },
  });

  // Sinkronisasi data profil tambahan ke users.json
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    users.push({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: role.toLowerCase(),
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || 'Jakarta Selatan',
      postalCode: data.postalCode || '12340',
      createdAt: newUser.createdAt.toISOString(),
    });
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Sync user profile to JSON failed:', err);
  }

  return toSafeUser(newUser, data);
}
