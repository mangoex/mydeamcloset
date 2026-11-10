import { AssistantConfig } from '../types/auth';
import { ClothingItem } from '../types/wardrobe';

export interface FashionConsultationResult {
  verdict: 'NO_COMBINA' | 'SI_COMBINA' | 'CUIDADO_DEPENDE';
  badge: string;
  badgeColor: string;
  title: string;
  directAnswer: string;
  reason: string;
  fixRecommendation: string;
  fullMessage: string;
}

// Comprehensive fashion rules knowledge base
export function evaluateFashionQuestion(
  question: string,
  config?: Partial<AssistantConfig>,
  wardrobe?: ClothingItem[]
): FashionConsultationResult {
  const q = question.toLowerCase().trim();
  const p = config?.personality || 'chic';
  const name = config?.name || 'Estilista';

  // Rule 1: Choque de Estampados (Cuadros + Estampado / Flores / Rayas / Animal Print)
  const mentionsCuadros = q.includes('cuadro') || q.includes('escoc') || q.includes('tartan') || q.includes('plaid') || q.includes('vichy');
  const mentionsEstampado = q.includes('estampad') || q.includes('print') || q.includes('flor') || q.includes('raya') || q.includes('animal') || q.includes('leopardo') || q.includes('zebra') || q.includes('lunar') || q.includes('polka');
  
  const isPatternClash = mentionsCuadros && mentionsEstampado;
  const isGeneralClash = (q.includes('estampad') && (q.includes('raya') || q.includes('flor') || q.includes('animal')));

  if (isPatternClash || isGeneralClash) {
    let direct = '';
    let intro = '';

    if (p === 'amiga') {
      intro = `¡Ay amiga, qué bueno que me preguntaste antes de salir! La verdad es que **NO combina en lo absoluto** y no te dejaría salir así a la calle jamás.`;
    } else if (p === 'chic') {
      intro = `**Rotundamente no combina**. En la consultoría de moda y alta costura, este es uno de los mayores errores de estilismo.`;
    } else if (p === 'zen') {
      intro = `**No combina**. Rompe la armonía estética y genera un exceso de ruido visual que satura la silueta.`;
    } else {
      intro = `¡Uff, frenemos ahí mismo! **Definitivamente NO combina**. Te verías sobrecargada y perderías el impacto de ambas prendas.`;
    }

    const reason = `Juntar dos prendas estampadas distintas (como cuadros y flores/estampados abstractos) provoca un **choque visual directo ('pattern clash')**. Ambas piezas compiten con fuerza por captar la atención, rompen la armonía de la mirada y hacen que el atuendo luzca desordenado o recargado.`;

    const fixRecommendation = `La regla de oro de la moda es: **un solo estampado protagonista a la vez**:
• **Opción A (Luce los cuadros):** Ponte tu prenda de cuadros y combínala con una blusa o prenda superior **completamente lisa y neutra** (blanca, negra, beige o que rescate el color secundario de las líneas del cuadro).
• **Opción B (Luce el estampado):** Si quieres destacar la blusa estampada, llévala con un pantalón o falda lisa en color neutro.
• **Calzado recomendado:** Unos mocasines, botines limpios o zapatillas neutras completarán un look pulido y elegante sin saturar.`;

    return {
      verdict: 'NO_COMBINA',
      badge: '❌ No combina',
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
      title: 'Choque de Estampados (Pattern Clash)',
      directAnswer: `${intro} ${reason}`,
      reason,
      fixRecommendation,
      fullMessage: `${intro}\n\n**¿Por qué no funciona?**\n${reason}\n\n**¿Cómo arreglarlo para verte increíble?**\n${fixRecommendation}`,
    };
  }

  // Rule 2: Animal Print con otro estampado
  if (q.includes('animal') || q.includes('leopardo') || q.includes('cebra') || q.includes('serpiente')) {
    if (q.includes('cuadro') || q.includes('raya') || q.includes('flor') || q.includes('estampad')) {
      return {
        verdict: 'NO_COMBINA',
        badge: '❌ No combina',
        badgeColor: 'bg-red-100 text-red-800 border-red-300',
        title: 'Exceso de Protagonismo Visual',
        directAnswer: `**No, no te lo recomiendo**. El animal print ya tiene suficiente fuerza por sí mismo.`,
        reason: `El animal print es una textura de máximo impacto visual. Mezclarlo con otro estampado satura la imagen y le quita elegancia al look.`,
        fixRecommendation: `Combina el animal print exclusivamente con prendas lisas en tonos negros, camel, blanco crudo o denim clásico. Deja que el print sea la única estrella.`,
        fullMessage: `**No, no combina**. El animal print tiene tanta personalidad que mezclarlo con otros patrones distorsiona el outfit. Combínalo siempre con prendas lisas y estructuradas (negro, beige, blanco o mezclilla) para verte elegante y sofisticada.`,
      };
    }
  }

  // Rule 3: Choque de Formalidad Extrema (Chanclas/Crocs con ropa sastre o formal)
  if ((q.includes('chancla') || q.includes('crocs') || q.includes('sandalia de plastico') || q.includes('playera')) &&
      (q.includes('sastre') || q.includes('blazer') || q.includes('vestir') || q.includes('formal') || q.includes('gala'))) {
    return {
      verdict: 'NO_COMBINA',
      badge: '❌ No combina',
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
      title: 'Incompatibilidad de Código de Vestimenta',
      directAnswer: `**No combina bajo ningún concepto.**`,
      reason: `El calzado de piscina o playa destruye la estructura, la caída y la elegancia de la sastrería o de un pantalón formal.`,
      fixRecommendation: `Para un pantalón sastre o blazer, usa mocasines, zapatillas de vestir limpias (court sneakers blancas), zapatos destalonados o botines de cuero.`,
      fullMessage: `**No, no combina.** Salir con pantalón de vestir y chanclas rompe por completo la intención del outfit. Si buscas comodidad, opta por unos tenis blancos minimalistas o unos mocasines suaves.`,
    };
  }

  // Rule 4: Vestido de fiesta / gala con tenis deportivos sucios o de running
  if ((q.includes('vestido') && (q.includes('gala') || q.includes('fiesta') || q.includes('noche') || q.includes('satin') || q.includes('lentejuela'))) &&
      (q.includes('tenis') || q.includes('zapatilla deportiva') || q.includes('running'))) {
    return {
      verdict: 'NO_COMBINA',
      badge: '❌ No combina',
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
      title: 'Choque de Ocasión y Tejidos',
      directAnswer: `**No combina.**`,
      reason: `Los tejidos delicados de noche (satén, seda, terciopelo o pedrería) no armonizan con calzado técnico deportivo.`,
      fixRecommendation: `Para vestidos de noche usa sandalias de tacón fino, tacón bloque o flats puntiagudas en acabado satinado o metalizado.`,
      fullMessage: `**No, no combina.** Un vestido de fiesta con tenis de deporte desluce el vestido por completo. Si necesitas calzado plano para no cansarte, opta por unas bailarinas puntiagudas o sandalias planas joya.`,
    };
  }

  // Rule 5: Rojo brillante con Verde brillante (Efecto Navideño Involuntario)
  if (q.includes('rojo') && q.includes('verde')) {
    const isMilitary = q.includes('oliva') || q.includes('militar') || q.includes('caqui') || q.includes('vino') || q.includes('burdeos');
    if (!isMilitary) {
      return {
        verdict: 'CUIDADO_DEPENDE',
        badge: '⚠️ Cuidado: Riesgo de Efecto Disfraz',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        title: 'Contraste Complementario Intenso',
        directAnswer: `**Cuidado, no te lo aconsejo para uso diario.**`,
        reason: `Rojo vivo y verde saturado son colores directamente opuestos en la rueda de color. Juntos en prendas grandes evocan de inmediato un disfraz o temática navideña.`,
        fixRecommendation: `Si quieres llevar verde y rojo, cambia la intensidad: usa verde oliva/militar con rojo borgoña/vino, o usa uno de los colores solo como accesorio sutil (labios o bolso pequeño) con un neutro de base.`,
        fullMessage: `**Cuidado, no te lo recomiendo tal cual.** El rojo y verde brillantes compiten muchísimo y crean un efecto navideño involuntario. Para que funcione con estilo, mezcla tonos apagados como verde militar con vino, o usa un fondo neutro (blanco o negro).`,
      };
    }
  }

  // Rule 6: Rosa y Rojo (Color Block Armonioso)
  if ((q.includes('rosa') || q.includes('fucsia')) && (q.includes('rojo') || q.includes('carmesi'))) {
    return {
      verdict: 'SI_COMBINA',
      badge: '✅ Sí combina (Color Block Chic)',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Tendencia Editorial Color Block',
      directAnswer: `**¡Sí, combina muy bien!**`,
      reason: `El rosa y el rojo son colores análogos con una energía vibrante. Es una de las combinaciones más aclamadas de pasarela (favorita de casas como Valentino).`,
      fixRecommendation: `El truco para lucirlo impecable es que ambas prendas sean de cortes limpios, minimalistas y sin estampados, con calzado y accesorios neutros (nude, negro o dorado).`,
      fullMessage: `**¡Sí, combina excelente!** El rojo con rosa o fucsia es una combinación de color-blocking moderna y muy sofisticada. Solo asegúrate de que las prendas sean lisas y de cortes definidos para que luzca de alta costura.`,
    };
  }

  // Rule 7: Negro y Azul Marino o Negro y Marrón Oscuro
  if (q.includes('negro') && (q.includes('marino') || q.includes('azul oscuro') || q.includes('marron') || q.includes('cafe'))) {
    return {
      verdict: 'CUIDADO_DEPENDE',
      badge: '⚠️ Depende de la Textura',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      title: 'Contraste de Valores Oscuros',
      directAnswer: `**Depende del contraste de texturas.**`,
      reason: `Si las dos telas son oscuras, lisas y del mismo material, parece que te equivocaste de prenda con poca luz.`,
      fixRecommendation: `Para que se vea intencional, mezcla texturas distintas: por ejemplo, jersey de punto azul marino con pantalón de cuero negro, o introduce una capa blanca/beige en medio para separar ambos tonos.`,
      fullMessage: `**Cuidado, depende de cómo lo lleves.** Negro con azul marino o marrón oscuro puede verse apagado si no hay contraste. La clave es mezclar texturas distintas (lana con cuero o satén) o añadir un toque blanco/beige que ilumine.`,
    };
  }

  // Rule 8: Prenda oversize con otra oversize
  if (q.includes('oversize') || q.includes('holgad') || q.includes('anch') || q.includes('ampli')) {
    if (q.includes('con') && (q.includes('pantalon ancho') || q.includes('palazzo') || q.includes('falda larga') || q.includes('sueter grande'))) {
      return {
        verdict: 'CUIDADO_DEPENDE',
        badge: '⚠️ Equilibrio de Silueta',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        title: 'Regla de Volúmenes y Proporciones',
        directAnswer: `**Cuidado con perder la figura.**`,
        reason: `Llevar prendas muy holgadas tanto arriba como abajo puede esconder por completo tu silueta y hacerte ver como un bloque sin forma.`,
        fixRecommendation: `Compensa los volúmenes: si la prenda superior es oversize, usa un pantalón ceñido o recto; o bien, faja la prenda superior por delante (fajado francés) y añade un cinturón para definir la cintura.`,
        fullMessage: `**Cuidado con las proporciones.** Usar holgado arriba y abajo puede engullir tu figura. Si vas a usar un suéter o blazer oversize, faja un lateral o acompáñalo de un pantalón de corte recto y calzado con un poco de empeine visible para alargar la silueta.`,
      };
    }
  }

  // Rule 9: Blanco con Mezclilla / Denim / Neutros
  if ((q.includes('blanco') || q.includes('beige') || q.includes('crema')) && (q.includes('jeans') || q.includes('mezclilla') || q.includes('denim'))) {
    return {
      verdict: 'SI_COMBINA',
      badge: '✅ Sí combina perfectamente',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'Clásico Atemporal Infalible',
      directAnswer: `**¡Sí, combina al 100%!**`,
      reason: `Es la base del armario cápsula perfecto. Proporciona frescura, limpieza visual y funciona tanto de día como de noche cambiando solo los zapatos y accesorios.`,
      fixRecommendation: `Añade un cinturón de cuero o accesorios dorados para elevar el look de casual a chic.`,
      fullMessage: `**¡Sí, combina a la perfección!** La mezcla de blanco o neutros con denim es un clásico eterno que jamás falla. Si quieres darle un toque extra, agrega accesorios dorados o un bolso estructurado.`,
    };
  }

  // Rule 10: ¿Qué me pongo con [prenda]?
  if (q.includes('que me pongo') || q.includes('con que combino') || q.includes('como combino') || q.includes('zapatos para')) {
    let suggestion = '';
    if (q.includes('falda de cuadros') || q.includes('cuadro')) {
      suggestion = `Para tu **falda de cuadros**, el look perfecto para no fallar es:\n1. **Prenda superior:** Blusa, camisa o suéter de cuello alto liso en color negro, blanco o beige.\n2. **Calzado:** Botines de cuero negros, mocasines con suela track o zapatillas blancas clásicas.\n3. **Capa extra:** Cazadora de cuero o blazer neutro. ¡Te verás con mucho estilo y cero sobrecargada!`;
    } else if (q.includes('pantalon blanco') || q.includes('jeans blanco')) {
      suggestion = `Para **pantalón blanco**, combínalo con blusas en tonos pasteles, azul celeste, rayas marineras o suéteres tierra/camel. Calzado camel, nude o sandalias veraniegas.`;
    } else if (q.includes('bota') || q.includes('botin')) {
      suggestion = `Para **botas**, lucen increíbles con jeans de corte recto ajustados en el tobillo, vestidos de punto midi o faldas con medias tupidas en invierno.`;
    } else {
      suggestion = `Para lograr la combinación ideal, elige una sola prenda como protagonista (por su color o textura) y acompaña el resto con piezas neutras y limpias que equilibren el look.`;
    }

    return {
      verdict: 'SI_COMBINA',
      badge: '💡 Guía de Estilo Experta',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      title: 'Asesoría de Combinación Personalizada',
      directAnswer: `Aquí tienes la fórmula exacta para combinarlo con éxito:`,
      reason: `El secreto está en equilibrar texturas y dejar que una pieza principal destaque sin rivales.`,
      fixRecommendation: suggestion,
      fullMessage: `${suggestion}`,
    };
  }

  // Default intelligent evaluation for any combination question
  const isAskingIfMatches = q.includes('combina') || q.includes('queda bien') || q.includes('se ve bien') || q.includes('puedo usar') || q.includes('me pongo');

  if (isAskingIfMatches) {
    let verdictText = '';
    if (p === 'amiga') {
      verdictText = `¡Analicemos eso juntas con total sinceridad! Mi prioridad número uno es que jamás salgas sintiéndote insegura ni descombinada.`;
    } else if (p === 'chic') {
      verdictText = `Evaluemos la composición estética con rigor editorial para garantizar que cumpla con los estándares de estilo.`;
    } else if (p === 'zen') {
      verdictText = `Busquemos el balance armónico ideal para esa selección.`;
    } else {
      verdictText = `¡Revisemos ese match con lupa de experto antes de que pises la calle!`;
    }

    return {
      verdict: 'CUIDADO_DEPENDE',
      badge: '🔍 Análisis de Estilo',
      badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
      title: 'Consulta de Combinación',
      directAnswer: verdictText,
      reason: `Para saber si combina, ten en cuenta la regla básica: nunca mezcles dos estampados llamativos distintos (cuadros, flores, lunares) a menos que quieras arriesgarte a una sobrecarga visual. Usa siempre una prenda lisa para equilibrar.`,
      fixRecommendation: `Si tienes dudas frente al espejo, simplifica: una prenda protagonista + prendas lisas complementarias = acierto asegurado.`,
      fullMessage: `${verdictText}\n\n**Regla de Oro:**\n• **Estampados:** Si una prenda tiene estampados o cuadros, la otra DEBE ser lisa.\n• **Colores:** Mantén máximo 3 colores en el look, con al menos un neutro de base.\n• **Silueta:** Equilibra volúmenes (si es ancho arriba, recto o ajustado abajo).`,
    };
  }

  // Conversational response with honesty
  return {
    verdict: 'SI_COMBINA',
    badge: '✨ Asistente de Estilo',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-300',
    title: 'Respuesta de tu Estilista',
    directAnswer: `Aquí estoy para guiarte en lo que necesites.`,
    reason: `Pregúntame cosas concretas como "¿combina falda de cuadros con suéter negro?", "¿qué zapatos van con mi vestido?", o "¿combina rojo con verde?" y te daré mi veredicto honesto sin rodeos.`,
    fixRecommendation: `Estoy aquí para que tu estilo brille con seguridad real.`,
    fullMessage: `¡Hola! Aquí estoy para ayudarte a vestir con total seguridad. Pregúntame si dos prendas combinan, qué zapatos elegir o cómo equilibrar tus estampados y te diré la verdad sin filtros para que siempre salgas impecable.`,
  };
}
