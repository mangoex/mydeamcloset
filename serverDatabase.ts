import fs from 'fs';
import path from 'path';

export interface DatabaseSchema {
  version: number;
  updatedAt: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    favoriteStyle: string;
    createdAt: number;
  }>;
  credentialsVault: Record<string, string>;
  wardrobes: Record<string, any[]>;
  outfits: Record<string, any[]>;
}

// Determine active database path (handling Vercel serverless read-only filesystem)
function getDatabaseFilePath(): string {
  const isVercel = !!process.env.VERCEL;
  if (isVercel) {
    const tmpPath = path.join('/tmp', 'database.json');
    if (!fs.existsSync(tmpPath)) {
      try {
        const seedPath = path.resolve(process.cwd(), 'data', 'database.json');
        if (fs.existsSync(seedPath)) {
          const content = fs.readFileSync(seedPath, 'utf8');
          fs.writeFileSync(tmpPath, content, 'utf8');
        }
      } catch (err) {
        console.error('Error copying seed database to /tmp:', err);
      }
    }
    return tmpPath;
  }

  // Local development
  return path.resolve(process.cwd(), 'data', 'database.json');
}

// In-memory memory cache
let cachedDatabase: DatabaseSchema | null = null;

export function loadDatabase(): DatabaseSchema {
  if (cachedDatabase) return cachedDatabase;

  const dbPath = getDatabaseFilePath();
  try {
    if (fs.existsSync(dbPath)) {
      const raw = fs.readFileSync(dbPath, 'utf8');
      cachedDatabase = JSON.parse(raw);
      return cachedDatabase!;
    }
  } catch (error) {
    console.error('Error reading database file:', error);
  }

  // Fallback initial database
  cachedDatabase = {
    version: 1,
    updatedAt: Date.now(),
    users: [
      {
        id: 'user_renata_01',
        name: 'Renata',
        email: 'renikenini1@gmail.com',
        avatarColor: 'bg-rose-500',
        favoriteStyle: 'Casual Chic & Tendencias',
        createdAt: Date.now() - 100000,
      },
      {
        id: 'user_miguel_02',
        name: 'Miguel',
        email: 'miguel@mydreamcloset.app',
        avatarColor: 'bg-stone-800',
        favoriteStyle: 'Streetwear & Minimalista Urbano',
        createdAt: Date.now() - 50000,
      },
    ],
    credentialsVault: {},
    wardrobes: {
      user_renata_01: [],
      user_miguel_02: [],
    },
    outfits: {
      user_renata_01: [],
      user_miguel_02: [],
    },
  };
  return cachedDatabase;
}

export function persistDatabase(db: DatabaseSchema): boolean {
  try {
    cachedDatabase = db;
    db.updatedAt = Date.now();
    const dbPath = getDatabaseFilePath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving database file:', error);
    return false;
  }
}

// Multi-tenant helper methods
export function getDbUsers() {
  const db = loadDatabase();
  return db.users || [];
}

export function registerDbUser(
  name: string,
  email: string,
  passwordHash: string,
  favoriteStyle: string
) {
  const db = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();

  const existing = (db.users || []).find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { error: 'Ya existe una cuenta con este correo' };
  }

  const avatarColors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-stone-800',
  ];
  const pickedColor = avatarColors[(db.users.length) % avatarColors.length];

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    email: cleanEmail,
    avatarColor: pickedColor,
    favoriteStyle: favoriteStyle || 'Casual Chic',
    createdAt: Date.now(),
  };

  db.users.push(newUser);
  db.credentialsVault[cleanEmail] = passwordHash;
  db.wardrobes[newUser.id] = [];
  db.outfits[newUser.id] = [];

  persistDatabase(db);
  return { user: newUser };
}

export function authenticateDbUser(email: string, passwordHash: string) {
  const db = loadDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const user = (db.users || []).find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { error: 'No se encontró ninguna cuenta con ese correo' };
  }

  const expected = db.credentialsVault[cleanEmail];
  if (expected && expected !== passwordHash) {
    return { error: 'Contraseña incorrecta' };
  }

  return { user };
}

export function getDbUserWardrobe(userId: string) {
  const db = loadDatabase();
  return db.wardrobes?.[userId] || [];
}

export function setDbUserWardrobe(userId: string, items: any[]) {
  const db = loadDatabase();
  if (!db.wardrobes) db.wardrobes = {};
  db.wardrobes[userId] = items;
  persistDatabase(db);
  return db.wardrobes[userId];
}

export function getDbUserOutfits(userId: string) {
  const db = loadDatabase();
  return db.outfits?.[userId] || [];
}

export function setDbUserOutfits(userId: string, outfits: any[]) {
  const db = loadDatabase();
  if (!db.outfits) db.outfits = {};
  db.outfits[userId] = outfits;
  persistDatabase(db);
  return db.outfits[userId];
}
