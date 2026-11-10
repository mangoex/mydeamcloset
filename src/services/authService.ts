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
  {
    id: 'zen_minimal',
    name: 'Gia',
    emoji: '🌿',
    style: 'Zen & Minimalista',
    gradient: 'from-emerald-400 to-teal-700',
    textColor: 'text-emerald-700',
  },
  {
    id: 'hype_star',
    name: 'Leo',
    emoji: '🔥',
    style: 'Hype & Vanguardia',
    gradient: 'from-orange-500 to-red-600',
    textColor: 'text-orange-600',
  },
  {
    id: 'paris_couture',
    name: 'Camille',
    emoji: '👒',
    style: 'Vintage & París',
    gradient: 'from-purple-400 to-indigo-700',
    textColor: 'text-purple-700',
  },
  {
    id: 'modern_stylist',
    name: 'Mateo',
    emoji: '🕶️',
    style: 'Streetwear & Urbano',
    gradient: 'from-blue-500 to-slate-900',
    textColor: 'text-blue-700',
  },
];

// Helper to hash password client-side
function hashPassword(password: string): string {
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
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading registered users:', e);
  }
  return [];
}

export function getActiveSessionUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_SESSION_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading active session user:', e);
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

  // Save user profile
  const updatedUsers = [...existingUsers, newUser];
  localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(updatedUsers));

  // Save hashed password in vault
  try {
    const vaultRaw = localStorage.getItem(PASSWORDS_HASH_KEY) || '{}';
    const vault = JSON.parse(vaultRaw);
    vault[cleanEmail] = hashPassword(password);
    localStorage.setItem(PASSWORDS_HASH_KEY, JSON.stringify(vault));
  } catch (e) {
    console.error('Error saving password vault:', e);
  }

  // Set active session
  localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(newUser));

  // Explicitly initialize this user's wardrobe and saved outfits as EMPTY
  // so no user ever inherits another user's closet!
  setUserWardrobe(newUser.id, []);
  setUserSavedOutfits(newUser.id, []);

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

  try {
    const vaultRaw = localStorage.getItem(PASSWORDS_HASH_KEY) || '{}';
    const vault = JSON.parse(vaultRaw);
    const expectedHash = vault[cleanEmail];
    if (expectedHash && expectedHash !== hashPassword(password)) {
      return { error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
    }
  } catch (e) {
    console.error('Error checking password:', e);
  }

  // Set active session
  localStorage.setItem(CURRENT_SESSION_USER_KEY, JSON.stringify(foundUser));
  return { user: foundUser };
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_SESSION_USER_KEY);
}

// Multi-tenant user data getters & setters
export function getUserWardrobe(userId: string): ClothingItem[] {
  try {
    const raw = localStorage.getItem(`mydreamcloset_wardrobe_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting user wardrobe:', e);
  }
  return [];
}

export function setUserWardrobe(userId: string, items: ClothingItem[]): void {
  try {
    localStorage.setItem(`mydreamcloset_wardrobe_${userId}`, JSON.stringify(items));
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
  } catch (e) {
    console.error('Error saving user outfits:', e);
  }
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

    // Read any legacy items that were uploaded
    let legacyItems: ClothingItem[] = [];
    try {
      const leg = localStorage.getItem('vestiria_user_wardrobe_v3');
      if (leg) {
        const parsed = JSON.parse(leg);
        if (Array.isArray(parsed) && parsed.length > 0) {
          legacyItems = parsed;
        }
      }
    } catch {
      // ignore
    }

    // If Renata exists, ensure her closet has her items
    if (renataUser) {
      const renataItems = getUserWardrobe(renataUser.id);
      if (renataItems.length === 0 && legacyItems.length > 0) {
        setUserWardrobe(renataUser.id, legacyItems);
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
        const renataItems = renataUser ? getUserWardrobe(renataUser.id) : legacyItems;

        // If it's Miguel or if the user's wardrobe was accidentally populated with Renata's exact items
        if (isMiguel) {
          setUserWardrobe(u.id, []);
          setUserSavedOutfits(u.id, []);
        } else if (
          renataItems.length > 0 &&
          currentItems.length === renataItems.length &&
          currentItems.length > 0 &&
          currentItems[0].id === renataItems[0].id
        ) {
          setUserWardrobe(u.id, []);
          setUserSavedOutfits(u.id, []);
        }
      }
    }

    // 3. Remove all legacy keys permanently so no user can ever inherit another's items
    localStorage.removeItem('vestiria_user_wardrobe_v3');
    localStorage.removeItem('vestiria_user_saved_outfits_v3');
    localStorage.removeItem('vestiria_wardrobe_items_v2');
    localStorage.removeItem('vestiria_wardrobe_items_v1');
  } catch (e) {
    console.error('Error enforcing wardrobe isolation:', e);
  }
}

export function getUserAssistantConfig(userId: string): AssistantConfig {
  try {
    const raw = localStorage.getItem(`mydreamcloset_assistant_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting assistant config:', e);
  }
  return DEFAULT_ASSISTANT_CONFIG;
}

export function setUserAssistantConfig(userId: string, config: AssistantConfig): void {
  try {
    localStorage.setItem(`mydreamcloset_assistant_${userId}`, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving assistant config:', e);
  }
}

// Generate bespoke personality compliments
export function generateStylistCompliment(
  config: AssistantConfig,
  context?: {
    garmentNames?: string[];
    colors?: string[];
    weather?: string;
    action?: 'assembled' | 'today' | 'general';
  }
): { compliment: string; suggestion: string } {
  const name = config.name || 'Tu Estilista';
  const personality = config.personality || 'amiga';
  const garmentNote = context?.garmentNames?.length
    ? context.garmentNames.slice(0, 2).join(' con ')
    : '';

  if (personality === 'hype') {
    const compliments = [
      `¡¡PARAAA TODO!! 🔥 ¿Quién te dio permiso para verte TAN absolutamente espectacular?`,
      `¡1000/10! ¡Esa combinación de ${garmentNote || 'prendas'} tiene vibra de portada de revista internacional!`,
      `¡Diosa total! Vas a iluminar cualquier lugar a donde vayas hoy. ¡Imparable!`,
      `¡Por favor, qué estilazo! Te juro que eres mi persona favorita para armar looks.`,
    ];
    const suggestions = [
      `Súmale una sonrisa ganadora y unos accesorios llamativos. ¡Estás para romperla!`,
      `Camina como si tuvieras tu propia música de fondo hoy. ¡A romperla!`,
    ];
    return {
      compliment: compliments[Math.floor(Math.random() * compliments.length)],
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
    };
  }

  if (personality === 'chic') {
    const compliments = [
      `Una proporción impecable y sumamente vanguardista. La caída de ${garmentNote || 'las piezas'} demuestra un gusto exquisito.`,
      `Elegancia pura sin esfuerzo. Este equilibrio cromático refleja sofisticación de pasarela.`,
      `Sublime. Es una declaración de estilo limpia, moderna y con mucha presencia.`,
      `El diálogo visual entre las prendas es perfecto. Menos ornamentos, más distinción.`,
    ];
    const suggestions = [
      `Para elevar aún más el conjunto, considera un bolso estructurado o calzado en tonos complementarios.`,
      `Un detalle minimalista de joyería dorada o plateada cerrará el look a nivel editorial.`,
    ];
    return {
      compliment: compliments[Math.floor(Math.random() * compliments.length)],
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
    };
  }

  if (personality === 'zen') {
    const compliments = [
      `Una armonía natural, serena y auténtica. Se nota que te sientes cómoda y fiel a ti misma.`,
      `Qué paz y frescura transmite este look. La sencillez bien llevada siempre es la máxima elegancia.`,
      `Te ves radiante de una forma tan natural. Ligero, limpio y con una energía hermosa.`,
      `Equilibrio perfecto entre confort y estilo. Te sienta de maravilla.`,
    ];
    const suggestions = [
      `Disfruta tu día sintiéndote ligera y cómoda en cada paso.`,
      `Acompaña tu día con tejidos transpirables y una actitud relajada.`,
    ];
    return {
      compliment: compliments[Math.floor(Math.random() * compliments.length)],
      suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
    };
  }

  // Default: Amiga dulce & entusiasta
  const compliments = [
    `¡Ay amiga, te ves preciosa! En serio, ${garmentNote ? `ese ${garmentNote}` : 'este outfit'} resalta lo mejor de ti.`,
    `¡Amo con locura esta combinación! Tienes una intuición increíble para elegir lo que te queda bien ✨`,
    `¡Qué hermosa te ves hoy! Brillas por completo y ese conjunto te hace ver súper favorecida.`,
    `¡Un acierto absoluto! Si me lo pongo yo no me queda ni la mitad de bien que a ti. ¡Me encanta!`,
  ];
  const suggestions = [
    `Ponte tu perfume favorito y sal con toda la seguridad del mundo. ¡Vas a arrasar!`,
    `Un toque de brillo en los labios o tus aros preferidos y estás lista para triunfar.`,
  ];
  return {
    compliment: compliments[Math.floor(Math.random() * compliments.length)],
    suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
  };
}
