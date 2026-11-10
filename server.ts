import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS headers for iframe requests
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Allow base64 image uploads
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Google GenAI client if key exists
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint 1: Analyze an uploaded clothing item with Gemini Vision
app.post('/api/analyze-clothing', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userHint = '' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Falta la imagen para analizar' });
    }

    // Strip base64 prefix if included (e.g. "data:image/jpeg;base64,")
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    if (ai) {
      const prompt = `Analiza detalladamente esta prenda de vestir o calzado/accesorio.
Pista opcional del usuario: "${userHint}".
Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura exacta:
{
  "name": "Nombre descriptivo y atractivo de la prenda en español (ej: 'Suéter de punto acanalado beige')",
  "category": "top" | "bottom" | "outerwear" | "footwear" | "accessory" | "one_piece",
  "subCategory": "Tipo específico (ej: Suéter, Camiseta, Blazer, Abrigo largo, Jeans, Pantalón sastre, Falda, Vestido, Botas, Zapatillas, Bufanda, Gafas de sol)",
  "colors": ["Color primario", "Color secundario si existe"],
  "colorHex": "#códigoHexAproximado",
  "material": "Material estimado (ej: Algodón, Lana, Denim, Lino, Cuero, Seda)",
  "warmth": 1 a 5 (1 = Muy fresco para calor intenso, 3 = Templado/Media estación, 5 = Muy abrigador para frío intenso o nieve),
  "seasons": ["primavera" | "verano" | "otono" | "invierno"],
  "weather": ["calor_extremo" | "calor" | "templado" | "frio_moderado" | "frio_extremo" | "lluvia" | "viento"],
  "vibes": ["casual" | "elegante" | "minimalista" | "urbano" | "deportivo" | "bohemio"],
  "stylingAdvice": "Consejo experto breve de estilista sobre cómo lucir o combinar esta prenda.",
  "boundingBox": [0, 0, 1000, 1000]
}`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          prompt,
        ],
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'Eres un estilista de moda profesional de alta costura y asesor de imagen personal. Analizas prendas de ropa a partir de fotos con gran precisión en color, tela, silueta, adecuación térmica y estacional.',
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 7500)
      );

      const response = (await Promise.race([generatePromise, timeoutPromise])) as any;
      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);
      return res.json(parsedData);
    } else {
      // Fallback heuristics if no API key is present
      return res.json({
        name: 'Prenda subida',
        category: 'top',
        subCategory: 'Prenda superior',
        colors: ['Neutro'],
        colorHex: '#3b82f6',
        material: 'Tejido mixto',
        warmth: 3,
        seasons: ['primavera', 'otono', 'invierno'],
        weather: ['templado', 'frio_moderado'],
        vibes: ['casual', 'minimalista'],
        stylingAdvice: 'Pieza versátil para combinar con prendas neutras de tu armario.',
      });
    }
  } catch (error: any) {
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota') || error?.code === 429) {
      console.warn('Notice: Gemini API free tier quota reached, using local garment analyzer.');
    } else {
      console.error('Error analizando prenda:', error?.message || error);
    }
    // Return structured graceful fallback so user can still edit and save
    return res.status(200).json({
      name: 'Prenda personalizada',
      category: 'top',
      subCategory: 'Ropa',
      colors: ['Personalizado'],
      colorHex: '#64748b',
      material: 'Algodón / Mezcla',
      warmth: 3,
      seasons: ['primavera', 'otono'],
      weather: ['templado'],
      vibes: ['casual'],
      stylingAdvice: 'Añadida a tu armario. Puedes editar sus etiquetas en cualquier momento.',
      isFallback: true,
    });
  }
});

// Endpoint 2: Generate Outfits using user's real wardrobe items
app.post('/api/generate-outfit', async (req, res) => {
  try {
    const { items, season, weather, occasion, stylePreference = '', anchorItemId = '' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El armario está vacío' });
    }

    // Prepare catalog summary for Gemini
    const catalogSummary = items.map((it: any) => ({
      id: it.id,
      name: it.name,
      category: it.category,
      subCategory: it.subCategory,
      colors: it.colors,
      warmth: it.warmth,
      seasons: it.seasons,
      weather: it.weather,
      vibes: it.vibes,
    }));

    if (ai) {
      const prompt = `Tienes el siguiente inventario de ropa del armario del usuario (con sus IDs únicos):
${JSON.stringify(catalogSummary, null, 2)}

OBJETIVO DEL OUTFIT:
- Temporada: ${season} (primavera, verano, otono, invierno)
- Clima: ${weather} (calor_extremo, calor, templado, frio_moderado, frio_extremo, lluvia, viento)
- Ocasión: ${occasion} (casual, oficina, noche, formal, deporte, viaje, cita)
- Preferencia de estilo del usuario: "${stylePreference || 'Elegante y cómodo'}"
${anchorItemId ? `- Prenda obligatoria que DEBE formar parte del look: ID "${anchorItemId}"` : ''}

REGLAS DE ESTILISMO:
1. DEBES seleccionar prendas EXCLUSIVAMENTE de la lista proporcionada utilizando sus IDs exactos.
2. Un outfit completo coherente debe incluir:
   - Si es prenda completa (one_piece): El vestido/mono + calzado + (abrigo/chaqueta si el clima lo amerita) + accesorios opcionales.
   - Si es por piezas: Una prenda superior (top) + una prenda inferior (bottom) + calzado (footwear) + (outerwear si hace frío o lluvia) + accesorio opcional (accessory).
3. Adecúa la calidez térmica al clima solicitado (por ejemplo: si es "frio_extremo" o "invierno", prioriza abrigos cálidos, suéteres, botas; si es "calor", ropa fresca y ligera).
4. Armonía cromática: combina colores complementarios, monocromáticos o neutros equilibrados.

Devuelve ÚNICAMENTE un JSON con:
{
  "title": "Nombre creativo del look (ej: 'Elegancia Otoñal con Trench')",
  "itemIds": ["id1", "id2", ...],
  "harmonyScore": número entre 85 y 99,
  "temperatureSuitability": "Breve explicación de por qué es perfecto para el clima (${weather})",
  "styleExplanation": "Explicación de estilista sobre por qué esta combinación de colores y prendas funciona tan bien",
  "stylingTips": [
    "Consejo 1 práctico de postura o ajuste (ej: dobla las mangas, fajado francés)",
    "Consejo 2 sobre cómo llevar los accesorios o calzado"
  ],
  "layeringAdvice": "Consejo sobre capas según la temperatura (si aplica)"
}`;

      const generateOutfitPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'Eres un estilista de moda de renombre internacional. Creas combinaciones de ropa excepcionales, equilibradas, funcionales para el clima real y sumamente estilosas usando el armario del usuario.',
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI outfit timeout')), 7500)
      );

      const response = (await Promise.race([generateOutfitPromise, timeoutPromise])) as any;
      const responseText = response.text || '{}';
      const parsedData = JSON.parse(responseText);

      // Verify selected items exist in wardrobe
      const validItemIds = (parsedData.itemIds || []).filter((id: string) =>
        items.some((it: any) => it.id === id)
      );

      if (validItemIds.length >= 2) {
        parsedData.itemIds = validItemIds;
        return res.json(parsedData);
      }
    }

    // Heuristic Algorithmic Fallback if AI unavailable or selected < 2 items
    const fallbackOutfit = buildHeuristicOutfit(items, season, weather, occasion, anchorItemId);
    return res.json(fallbackOutfit);
  } catch (error: any) {
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota') || error?.code === 429) {
      console.warn('Notice: Gemini API free tier quota reached, using local outfit engine.');
    } else {
      console.error('Error generando outfit:', error?.message || error);
    }
    const { items, season, weather, occasion, anchorItemId } = req.body;
    const fallbackOutfit = buildHeuristicOutfit(items || [], season, weather, occasion, anchorItemId);
    return res.json(fallbackOutfit);
  }
});

// Endpoint 3: Honest Personal Stylist Fashion Consultation & Combination Verdict
app.post('/api/stylist-chat', async (req, res) => {
  try {
    const {
      message = '',
      assistantConfig = {},
      wardrobeSummary = [],
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Falta el mensaje de consulta' });
    }

    const {
      name = 'Valeria',
      personality = 'amiga',
    } = assistantConfig;

    if (ai) {
      const personalityVoice: Record<string, string> = {
        amiga: 'Eres la mejor amiga de la usuaria. Le hablas de tú, con cariño pero con ABSOLUTA SINCERIDAD. Si algo se ve mal o descombinado, NUNCA le mientes ni le das elogios vacíos: tu deber número uno es evitar que salga a la calle viéndose ridícula o con ropa que no combina.',
        chic: 'Eres una estilista de alta costura parisina. Elegante, rigurosa, precisa y sin rodeos. Tu juicio estético es impecable y no toleras combinaciones que arruinen las proporciones o saturen la mirada.',
        zen: 'Eres una asesora de imagen minimalista. Valoras el equilibrio visual, la serenidad y la limpieza de líneas. Detestas el ruido visual o la sobrecarga de estampados innecesarios.',
        hype: 'Eres una estilista de moda urbana y vanguardista. Audaz y enérgica, pero conocedora absoluta de las reglas de estilo: distingues con claridad la audacia de un desastre visual.',
      };

      const systemPrompt = `Eres ${name}, asesora de imagen y estilista de moda profesional.
${personalityVoice[personality] || personalityVoice.amiga}

REGLAS DE ORO:
1. Si el usuario te pregunta si dos prendas, colores, estampados o estilos combinan (ejemplo: "falda de cuadros y blusa con estampado, combina?", "combina rojo con verde?", etc.):
   - DEBES comenzar con un veredicto claro y directo: "❌ No, no combina.", "✅ Sí, combina muy bien.", o "⚠️ Cuidado, es muy arriesgado".
   - PROHIBIDO DAR ELOGIOS VACÍOS como "me fascina cómo piensas en cada detalle" o "te ves genial con todo". El usuario te está pidiendo un criterio técnico y sincero para no salir a la calle haciendo el ridículo.
   - Si NO combina (ejemplo clásico: falda de cuadros con blusa estampada, o animal print con flores), explica con claridad técnica por qué (choque de estampados 'pattern clash', saturación visual, competencia de protagonismo).
   - Explica la solución exacta de qué ponerse en su lugar (ej: "Usa la falda de cuadros con una blusa completamente lisa y neutra blanca o negra").
2. Si el usuario pide qué calzado o prendas ponerse con una pieza específica, dale 2 o 3 opciones infalibles y pulidas.
3. Responde en español, de forma estructurada y con párrafos breves o viñetas claras.`;

      const prompt = `Consulta del usuario: "${message}"

${wardrobeSummary.length > 0 ? `Prendas de referencia en su armario: ${JSON.stringify(wardrobeSummary.slice(0, 10))}` : ''}

Responde de acuerdo a tus reglas de honestidad y estilismo profesional.`;

      const chatPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.5,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Stylist chat timeout')), 6500)
      );

      const response = (await Promise.race([chatPromise, timeoutPromise])) as any;
      const responseText = response.text || '';
      if (responseText.trim()) {
        return res.json({ reply: responseText.trim(), source: 'gemini' });
      }
    }

    return res.json({ reply: null, source: 'fallback_needed' });
  } catch (error: any) {
    if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota') || error?.code === 429) {
      console.warn('Notice: Gemini API free tier quota reached, using local fallback.');
    } else {
      console.error('Error en /api/stylist-chat:', error?.message || error);
    }
    return res.json({ reply: null, source: 'error_fallback' });
  }
});

// Algorithmic Fallback to always guarantee a flawless outfit
function buildHeuristicOutfit(
  items: any[],
  season: string,
  weather: string,
  occasion: string,
  anchorItemId?: string
) {
  const isCold = weather?.includes('frio') || season === 'invierno' || season === 'otono';
  const isHot = weather?.includes('calor') || season === 'verano';

  const tops = items.filter((it) => it.category === 'top');
  const bottoms = items.filter((it) => it.category === 'bottom');
  const outers = items.filter((it) => it.category === 'outerwear');
  const shoes = items.filter((it) => it.category === 'footwear');
  const accessories = items.filter((it) => it.category === 'accessory');
  const onePieces = items.filter((it) => it.category === 'one_piece');

  const selectedIds: string[] = [];
  if (anchorItemId && items.some((i) => i.id === anchorItemId)) {
    selectedIds.push(anchorItemId);
  }

  const anchorItem = items.find((i) => i.id === anchorItemId);

  // Check if anchor is one_piece or if one piece works in hot weather
  if (anchorItem?.category === 'one_piece') {
    // already selected
  } else if (!anchorItem && onePieces.length > 0 && isHot && Math.random() > 0.5) {
    selectedIds.push(onePieces[0].id);
  } else {
    // Choose Top
    if (!anchorItem || anchorItem.category !== 'top') {
      const filteredTops = tops.filter((t) => (isCold ? t.warmth >= 3 : isHot ? t.warmth <= 2 : true));
      const pickTop = filteredTops[0] || tops[0];
      if (pickTop && !selectedIds.includes(pickTop.id)) selectedIds.push(pickTop.id);
    }
    // Choose Bottom
    if (!anchorItem || anchorItem.category !== 'bottom') {
      const pickBottom = bottoms[0];
      if (pickBottom && !selectedIds.includes(pickBottom.id)) selectedIds.push(pickBottom.id);
    }
  }

  // Choose Outerwear if chilly or rainy
  if ((isCold || weather === 'lluvia' || weather === 'viento') && outers.length > 0) {
    if (!anchorItem || anchorItem.category !== 'outerwear') {
      const pickOuter = outers.find((o) => (weather === 'lluvia' ? o.weather?.includes('lluvia') : true)) || outers[0];
      if (pickOuter && !selectedIds.includes(pickOuter.id)) selectedIds.push(pickOuter.id);
    }
  }

  // Choose Footwear
  if (!anchorItem || anchorItem.category !== 'footwear') {
    const pickShoe = shoes.find((s) => (isCold ? s.subCategory?.toLowerCase().includes('bota') : true)) || shoes[0];
    if (pickShoe && !selectedIds.includes(pickShoe.id)) selectedIds.push(pickShoe.id);
  }

  // Choose Accessory if available
  if (accessories.length > 0) {
    const pickAcc = accessories[0];
    if (pickAcc && !selectedIds.includes(pickAcc.id)) selectedIds.push(pickAcc.id);
  }

  return {
    title: `Look ${season ? season.charAt(0).toUpperCase() + season.slice(1) : 'Personalizado'} Funcional`,
    itemIds: selectedIds,
    harmonyScore: 92,
    temperatureSuitability: `Selección equilibrada para condiciones de ${weather || 'temperatura agradable'}`,
    styleExplanation: 'Combinación balanceada en siluetas y colores para máxima comodidad y versatilidad.',
    stylingTips: [
      'Mantén los colores neutros como base y añade un detalle de contraste.',
      'Ajusta la prenda superior sutilmente para marcar cintura y alargar proporciones.',
    ],
    layeringAdvice: isCold ? 'Lleva las prendas en capas para adaptar tu temperatura a interiores.' : undefined,
  };
}

// Development vs Production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`My Dream Closet server running at http://0.0.0.0:${PORT}`);
  });
}

// In Vercel serverless environment, the app is imported by api/index.ts.
// In container / local development, we start the listener.
if (!process.env.VERCEL) {
  startServer();
}

export default app;

