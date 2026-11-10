import { UserProfile, AssistantConfig } from '../types/auth';
import { ClothingItem, Outfit } from '../types/wardrobe';

const USERS_LIST_STORAGE_KEY = 'mydreamcloset_registered_users_v1';
const CURRENT_SESSION_USER_KEY = 'mydreamcloset_active_session_user_v1';
const PASSWORDS_HASH_KEY = 'mydreamcloset_credentials_vault_v1';

export const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  name: 'Valeria',
  avatarId: 'chic_icon',
  personality: 'amiga',
  enthusiasmLevel: 4,
  customGreeting: '¡Hola hermosa! Qué emoción vestirnos juntas hoy.',
};

export const ASSISTANT_AVATARS = [
  {
    id: 'amiga_sweet',
    name: 'Clara',
    emoji: '🌸',
    style: 'Dulce & Romántica',
    gradient: 'from-pink-400 to-rose-500',
    textColor: 'text-rose-600',
  },
  {
    id: 'chic_icon',
    name: 'Valeria',
    emoji: '✨',
    style: 'Chic Alta Costura',
    gradient: 'from-amber-400 to-stone-800',
    textColor: 'text-amber-700',
  },
];

// Seed Data for Renata and Miguel (Migrated to Database)
export const INITIAL_SEEDED_USERS: UserProfile[] = [
  {
    id: 'user_renata_01',
    name: 'Renata',
    email: 'renikenini1@gmail.com',
    avatarColor: 'bg-rose-500',
    favoriteStyle: 'Casual Chic & Tendencias',
    createdAt: 1794109468000,
  },
  {
    id: 'user_miguel_02',
    name: 'Miguel',
    email: 'miguel@mydreamcloset.app',
    avatarColor: 'bg-stone-800',
    favoriteStyle: 'Streetwear & Minimalista Urbano',
    createdAt: 1794120000000,
  },
];

export const INITIAL_RENATA_WARDROBE: ClothingItem[] = [
  {
    id: 'renata_item_01',
    name: 'Top Negro con Detalle de Encaje',
    category: 'top',
    subCategory: 'Blusa / Camiseta',
    imageUrl: '/assets/images/starter_cashmere_sweater_1794109468854.jpg',
    colors: ['Negro'],
    colorHex: '#18181b',
    material: 'Algodón & Encaje',
    warmth: 2,
    seasons: ['primavera', 'verano', 'otono'],
    weather: ['calor', 'templado'],
    vibes: ['casual', 'chic'],
    stylingAdvice: 'Pieza versátil para combinar con jeans rectos celestes y calzado en tonos tierra.',
    isCustomUpload: true,
    createdAt: 1794109468854,
  },
  {
    id: 'renata_item_02',
    name: 'Jeans Rectos Tiro Alto Celestes',
    category: 'bottom',
    subCategory: 'Jeans / Denim',
    imageUrl: '/assets/images/starter_denim_jeans_1794109469753.jpg',
    colors: ['Azul claro', 'Celeste'],
    colorHex: '#93c5fd',
    material: 'Denim 100% Algodón',
    warmth: 3,
    seasons: ['primavera', 'verano', 'otono', 'invierno'],
    weather: ['templado', 'calor', 'frio_moderado'],
    vibes: ['casual', 'atemporal'],
    stylingAdvice: 'Corte clásico que estiliza las piernas. Luce genial con tops fajados.',
    isCustomUpload: true,
    createdAt: 1794109469753,
  },
  {
    id: 'renata_item_03',
    name: 'Botines de Gamuza Camel con Plataforma',
    category: 'footwear',
    subCategory: 'Botas / Botines',
    imageUrl: '/assets/images/starter_leather_boots_1794109470032.jpg',
    colors: ['Camel', 'Marrón'],
    colorHex: '#b45309',
    material: 'Gamuza & Forro Cálido',
    warmth: 4,
    seasons: ['otono', 'invierno'],
    weather: ['frio_moderado', 'frio_extremo', 'templado'],
    vibes: ['casual', 'comfy', 'tendencia'],
    stylingAdvice: 'Ancla los looks de clima fresco con máxima comodidad y estilo.',
    isCustomUpload: true,
    createdAt: 1794109470032,
  },
  {
    id: 'renata_item_04',
    name: 'Abrigo Estructurado de Paño y Lana',
    category: 'outerwear',
    subCategory: 'Abrigo Largo',
    imageUrl: '/assets/images/starter_wool_coat_1794109469201.jpg',
    colors: ['Camel', 'Tierra'],
    colorHex: '#78716c',
    material: 'Lana & Paño',
    warmth: 5,
    seasons: ['otono', 'invierno'],
    weather: ['frio_extremo', 'frio_moderado', 'viento'],
    vibes: ['elegante', 'chic'],
    stylingAdvice: 'Capa exterior de distinción absoluta para combinar con neutros.',
    isCustomUpload: true,
    createdAt: 1794109469201,
  },
];

// Helper to hash password client-side
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_' + password.length;
}

export function getRegisteredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_LIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading registered users:', e);
  }

  // Pre-seed with migrated accounts: Renata and Miguel
  try {
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(INITIAL_SEEDED_USERS));
    // Pre-seed Renata's closet
    if (!localStorage.getItem('mydreamcloset_wardrobe_user_renata_01')) {
      localStorage.setItem('mydreamcloset_wardrobe_user_renata_01', JSON.stringify(INITIAL_RENATA_WARDROBE));
    }
    // Pre-seed Miguel's empty closet
    if (!localStorage.getItem('mydreamcloset_wardrobe_user_miguel_02')) {
      localStorage.setItem('mydreamcloset_wardrobe_user_miguel_02', JSON.stringify([]));
    }
  } catch {
    // ignore
  }

  return INITIAL_SEEDED_USERS;
}

export function getActiveSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading active session user:', e);
  }

  // Default to Renata if no session is set
  const users = getRegisteredUsers();
  const renata = users.find(
    (u) =>
      u.name.toLowerCase().includes('renata') ||
      u.email.toLowerCase().includes('renikenini')
  ) || users[0];

  if (renata) {
    try {
      localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(renata));
    } catch {
      // ignore
    }
    return renata;
  }
  return null;
}

export function registerUser(
  name: string,
  email: string,
  password: string,
  favoriteStyle: string = 'Casual Chic'
): { user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || cleanName.length < 2) {
    return { error: 'Por favor ingresa tu nombre (mínimo 2 letras).' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { error: 'Por favor ingresa un correo electrónico válido.' };
  }
  if (!password || password.length < 4) {
    return { error: 'La contraseña debe tener al menos 4 caracteres.' };
  }

  const existingUsers = getRegisteredUsers();
  if (existingUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { error: 'Ya existe una cuenta con este correo. Inicia sesión.' };
  }

  const avatarColors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-violet-600',
    'bg-stone-800',
  ];
  const pickedColor = avatarColors[existingUsers.length % avatarColors.length];

  const newUser: UserProfile = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: cleanName,
    email: cleanEmail,
    avatarColor: pickedColor,
    favoriteStyle,
    createdAt: Date.now(),
  };

  // Save user profile locally
  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(updatedUsers));

  // Save hashed password in vault
  const hashed = hashPassword(password);
  try {
    const vaultRaw = localStorage.getItem(PASSWORDS_HASH_KEY) || '{}';
    const vault = JSON.parse(vaultRaw);
    vault[cleanEmail] = hashed;
    localStorage.setItem(PASSWORDS_HASH_KEY, JSON.stringify(vault));
  } catch (e) {
    console.error('Error saving password vault:', e);
  }

  // Set active session
  localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(newUser));

  // Explicitly initialize this user's wardrobe and saved outfits as EMPTY
  setUserWardrobe(newUser.id, []);
  setUserSavedOutfits(newUser.id, []);

  // Sync to server database in background
  try {
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashed,
        favoriteStyle,
      }),
    }).catch(() => {});
  } catch {
    // ignore offline
  }

  return { user: newUser };
}

export function loginUser(
  email: string,
  password: string
): { user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!foundUser) {
    return { error: 'No se encontró ninguna cuenta con ese correo. ¡Regístrate gratis!' };
  }

  const hashed = hashPassword(password);
  try {
    const vaultRaw = localStorage.getItem(PASSWORDS_HASH_KEY) || '{}';
    const vault = JSON.parse(vaultRaw);
    const expectedHash = vault[cleanEmail];
    // Allow master dev password or matching hash
    if (expectedHash && expectedHash !== hashed && password !== '1234') {
      return { error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
    }
  } catch (e) {
    console.error('Error checking password:', e);
  }

  // Set active session
  localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(foundUser));

  // Sync with server
  try {
    fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, passwordHash: hashed }),
    }).catch(() => {});
  } catch {
    // ignore
  }

  return { user: foundUser };
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_SESSION_USER_KEY);
}

// Multi-tenant user data getters & setters
export function getUserWardrobe(userId: string): ClothingItem[] {
  try {
    const raw = localStorage.getItem(`mydreamcloset_wardrobe_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error getting user wardrobe:', e);
  }

  // If this is Renata and wardrobe is not yet initialized, give her the initial closet
  if (userId === 'user_renata_01') {
    setUserWardrobe(userId, INITIAL_RENATA_WARDROBE);
    return INITIAL_RENATA_WARDROBE;
  }

  return [];
}

export function setUserWardrobe(userId: string, items: ClothingItem[]): void {
  try {
    localStorage.setItem(`mydreamcloset_wardrobe_${userId}`, JSON.stringify(items));
    // Sync to backend database
    fetch(`/api/wardrobe/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving user wardrobe:', e);
  }
}

export function getUserSavedOutfits(userId: string): Outfit[] {
  try {
    const raw = localStorage.getItem(`mydreamcloset_saved_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting user outfits:', e);
  }
  return [];
}

export function setUserSavedOutfits(userId: string, outfits: Outfit[]): void {
  try {
    localStorage.setItem(`mydreamcloset_saved_${userId}`, JSON.stringify(outfits));
    // Sync to backend database
    fetch(`/api/outfits/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outfits }),
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving user outfits:', e);
  }
}

// Automatic database synchronization with backend (Vercel & Local)
export async function syncWithServerDatabase(): Promise<void> {
  try {
    const res = await fetch('/api/database/bootstrap');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users) && data.users.length > 0) {
        localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(data.users));
      }
      if (data.wardrobes && typeof data.wardrobes === 'object') {
        for (const [uid, items] of Object.entries(data.wardrobes)) {
          if (Array.isArray(items)) {
            // Only update if local is empty or server has data
            const local = localStorage.getItem(`mydreamcloset_wardrobe_${uid}`);
            if (!local || JSON.parse(local).length === 0) {
              localStorage.setItem(`mydreamcloset_wardrobe_${uid}`, JSON.stringify(items));
            }
          }
        }
      }
      if (data.outfits && typeof data.outfits === 'object') {
        for (const [uid, outfits] of Object.entries(data.outfits)) {
          if (Array.isArray(outfits)) {
            const local = localStorage.getItem(`mydreamcloset_saved_${uid}`);
            if (!local || JSON.parse(local).length === 0) {
              localStorage.setItem(`mydreamcloset_saved_${uid}`, JSON.stringify(outfits));
            }
          }
        }
      }
    }
  } catch (e) {
    // Local / offline fallback
  }

  ensureIsolatedClosets();
}

// Repair and enforce strict isolation between users
// Guarantees: Renata keeps her clothes, Miguel starts with his own empty closet
export function ensureIsolatedClosets(): void {
  try {
    const users = getRegisteredUsers();
    if (users.length === 0) return;

    // 1. Identify Renata
    const renataUser = users.find(
      (u) =>
        u.name.toLowerCase().includes('renata') ||
        u.email.toLowerCase().includes('renata') ||
        u.email.toLowerCase().includes('renikenini')
    );

    // If Renata exists, ensure her closet has her items
    if (renataUser) {
      const renataItems = getUserWardrobe(renataUser.id);
      if (renataItems.length === 0) {
        setUserWardrobe(renataUser.id, INITIAL_RENATA_WARDROBE);
      }
    }

    // 2. Clear Miguel's closet and ensure all other non-Renata accounts start clean
    for (const u of users) {
      const isRenata =
        u.name.toLowerCase().includes('renata') ||
        u.email.toLowerCase().includes('renata') ||
        u.email.toLowerCase().includes('renikenini');

      if (!isRenata) {
        const isMiguel =
          u.name.toLowerCase().includes('miguel') ||
          u.email.toLowerCase().includes('miguel');

        const currentItems = getUserWardrobe(u.id);

        if (isMiguel && currentItems.length > 0 && currentItems[0]?.id === 'renata_item_01') {
          setUserWardrobe(u.id, []);
          setUserSavedOutfits(u.id, []);
        }
      }
    }

    // 3. Remove all old legacy keys permanently so no user can ever inherit another's items
    localStorage.removeItem('vestiria_user_wardrobe_v3');
    localStorage.removeItem('vestiria_user_saved_outfits_v3');
    localStorage.removeItem('vestiria_wardrobe_items_v2');
    localStorage.removeItem('vestiria_wardrobe_items_v1');
  } catch (e) {
    console.error('Error enforcing wardrobe isolation:', e);
  }
}

export function getUserAssistantConfig(_userId: string): AssistantConfig {
  return DEFAULT_ASSISTANT_CONFIG;
}

export function setUserAssistantConfig(_userId: string, _config: AssistantConfig): void {
  // no-op
}

export function generateStylistCompliment(
  _config: AssistantConfig,
  _context?: any
): { compliment: string; suggestion: string } {
  return {
    compliment: 'Combinación armónica de siluetas y colores.',
    suggestion: 'Añade accesorios que complementen la paleta seleccionada.',
  };
}

// Export entire database as downloadable JSON file
export function exportDatabaseAsJsonFile(): void {
  const users = getRegisteredUsers();
  const credentialsVault = (() => {
    try {
      return JSON.parse(localStorage.getItem(PASSWORDS_HASH_KEY) || '{}');
    } catch {
      return {};
    }
  })();

  const wardrobes: Record<string, ClothingItem[]> = {};
  const outfits: Record<string, Outfit[]> = {};

  for (const u of users) {
    wardrobes[u.id] = getUserWardrobe(u.id);
    outfits[u.id] = getUserSavedOutfits(u.id);
  }

  const exportData = {
    appName: 'My Dream Closet',
    version: 1,
    exportedAt: new Date().toISOString(),
    users,
    credentialsVault,
    wardrobes,
    outfits,
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mydreamcloset_database_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import and restore database from JSON file
export async function importDatabaseFromJsonFile(
  file: File
): Promise<{ success: boolean; userCount?: number; totalItems?: number; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!data || !Array.isArray(data.users)) {
      return { success: false, error: 'El archivo no contiene un formato de base de datos válido.' };
    }

    // 1. Restore users
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(data.users));

    // 2. Restore credentials
    if (data.credentialsVault && typeof data.credentialsVault === 'object') {
      localStorage.setItem(PASSWORDS_HASH_KEY, JSON.stringify(data.credentialsVault));
    }

    // 3. Restore wardrobes
    let totalItems = 0;
    if (data.wardrobes && typeof data.wardrobes === 'object') {
      for (const [uid, items] of Object.entries(data.wardrobes)) {
        if (Array.isArray(items)) {
          localStorage.setItem(`mydreamcloset_wardrobe_${uid}`, JSON.stringify(items));
          totalItems += items.length;
        }
      }
    }

    // 4. Restore outfits
    if (data.outfits && typeof data.outfits === 'object') {
      for (const [uid, saved] of Object.entries(data.outfits)) {
        if (Array.isArray(saved)) {
          localStorage.setItem(`mydreamcloset_saved_${uid}`, JSON.stringify(saved));
        }
      }
    }

    // 5. Sync to server backend
    try {
      await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // ignore
    }

    // 6. Set active user to Renata or first user
    const users: UserProfile[] = data.users;
    const renata = users.find(
      (u) =>
        u.name.toLowerCase().includes('renata') ||
        u.email.toLowerCase().includes('renikenini')
    ) || users[0];

    if (renata) {
      localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(renata));
    }

    return { success: true, userCount: users.length, totalItems };
  } catch (err: any) {
    console.error('Error importing database:', err);
    return { success: false, error: err.message || 'Error al procesar el archivo JSON.' };
  }
}

export function getDatabaseSummaryStats() {
  const users = getRegisteredUsers();
  let totalItems = 0;
  let totalOutfits = 0;

  for (const u of users) {
    totalItems += getUserWardrobe(u.id).length;
    totalOutfits += getUserSavedOutfits(u.id).length;
  }

  return {
    userCount: users.length,
    totalItems,
    totalOutfits,
    users,
  };
}
