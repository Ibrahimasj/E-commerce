import fs from 'fs/promises';
import path from 'path';
import { User, StoredUser } from '@/types';

const USERS_FILE = path.join(process.cwd(), 'src/data/users.json');

let memoryUsersCache: StoredUser[] | null = null;

async function safeWriteUsers(users: StoredUser[]): Promise<void> {
  memoryUsersCache = users;
  for (let i = 0; i < 3; i++) {
    try {
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      return;
    } catch (e) {
      console.warn(`Write users attempt ${i + 1} failed:`, e);
      if (i === 2) return;
      await new Promise((r) => setTimeout(r, 100 * (i + 1)));
    }
  }
}

export function toSafeUser(stored: StoredUser): User {
  const { passwordHash, ...safe } = stored;
  return safe;
}

export async function getUsers(): Promise<StoredUser[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const parsed = JSON.parse(data) as StoredUser[];
    memoryUsersCache = parsed;
    return parsed;
  } catch (error) {
    console.error('Error reading users file:', error);
    if (memoryUsersCache) return memoryUsersCache;
    return [];
  }
}

export async function findUserByIdentifier(
  identifier: string
): Promise<StoredUser | null> {
  const users = await getUsers();
  const search = identifier.trim().toLowerCase();
  const cleanPhone = identifier.replace(/[^0-9]/g, '');

  return (
    users.find((u) => {
      // 1. Match Email
      if (u.email && u.email.toLowerCase() === search) return true;
      // 2. Match Name (case-insensitive)
      if (u.name && u.name.trim().toLowerCase() === search) return true;
      // 3. Match Phone number if at least 6 digits
      if (
        cleanPhone.length >= 6 &&
        u.phone &&
        u.phone.replace(/[^0-9]/g, '') === cleanPhone
      ) {
        return true;
      }
      return false;
    }) || null
  );
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  return findUserByIdentifier(email);
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  const users = await getUsers();
  return users.find((u) => u.id === id) || null;
}

export async function createUser(
  data: Omit<StoredUser, 'id' | 'createdAt'>
): Promise<User> {
  const users = await getUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
  );
  if (existing) {
    throw new Error('Alamat email sudah terdaftar.');
  }

  const newUser: StoredUser = {
    ...data,
    id: `usr-${Date.now()}`,
    email: data.email.trim().toLowerCase(),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await safeWriteUsers(users);
  return toSafeUser(newUser);
}
