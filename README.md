# My Dream Closet 👗✨

Armario virtual interactivo y estilista inteligente. Sube fotografías de tus prendas, la app elimina automáticamente el fondo y las centra sobre un lienzo blanco de estudio, y te permite crear outfits personalizados adaptados a temporadas (Primavera, Verano, Otoño, Invierno) y condiciones meteorológicas (calor extremo, templado, frío, lluvia).

## Características principales

- **Probador Visual en Carrusel**: Sistema de 3 secciones (parte de arriba, parte de abajo y calzado) con flechas para probar infinitas combinaciones de ropa en tiempo real.
- **Aislamiento de Fondo de Estudio**: Elimina el fondo de fotos tomadas en perchas, suelo o cama, dejando la prenda aislada en un lienzo blanco (`#FFFFFF`) con sombras de contacto.
- **Generador Inteligente de Outfits**: Combina exclusivamente las prendas de tu armario según temporada, temperatura y ocasión con sugerencias estilísticas.
- **¿Qué me pongo hoy?**: Selector interactivo de temperatura con detección climática y sugerencias diarias.
- **Gestión Completa de Prendas**: Selección múltiple para eliminar prendas en lote o individualmente con confirmación en pantalla.

---

## 🚀 Despliegue en Vercel

Este proyecto está preconfigurado para desplegarse en **Vercel** en un solo clic:

1. Importa el repositorio `mangoex/mydreamcloset` en tu dashboard de Vercel.
2. En la sección **Environment Variables**, añade:
   - `GEMINI_API_KEY`: Tu clave de API de Google Gemini (obtenida desde [Google AI Studio](https://aistudio.google.com/)).
3. Haz clic en **Deploy**. Vercel compilará automáticamente el frontend con Vite y desplegará los endpoints de la API (`/api/analyze-clothing` y `/api/generate-outfit`) como Serverless Functions.

---

## 💻 Ejecución local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/mangoex/mydreamcloset.git
   cd mydreamcloset
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` basándote en `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Añade tu `GEMINI_API_KEY`.

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
