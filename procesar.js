#!/usr/bin/env node
/**
 * Genera data/recomendaciones.json a partir de los documentos en ./documentos/<Tema>/archivo.pdf|.docx
 *
 * Requiere:
 *   - Node.js 18 o superior (usa fetch nativo)
 *   - Una clave gratuita de Gemini (https://aistudio.google.com/apikey)
 *   - npm install   (instala mammoth y pdf-parse)
 *
 * Uso:
 *   GEMINI_API_KEY=tu_clave node procesar.js
 *
 * Estructura esperada:
 *   documentos/
 *     Laboral/
 *       informe1.pdf
 *       informe2.docx
 *     Hidrocarburos/
 *       informe3.pdf
 *
 * Puedes volver a correr este script cuando quieras (por ejemplo, al agregar
 * documentos nuevos a las carpetas). Vuelve a procesar todos los archivos
 * encontrados y sobrescribe data/recomendaciones.json.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const API_KEY = process.env.GEMINI_API_KEY;

// Si este modelo deja de funcionar (Google los renueva con frecuencia),
// revisa el nombre vigente en https://ai.google.dev/gemini-api/docs/models
// y reemplázalo aquí. Cualquier modelo "flash" suele estar en el nivel gratuito.
const MODEL = 'gemini-2.5-flash';

const DOCS_DIR = path.join(__dirname, 'documentos');
const OUT_FILE = path.join(__dirname, 'data', 'recomendaciones.json');

// Pausa entre llamadas a la API para no exceder el límite gratuito
// (~10-15 solicitudes por minuto según el modelo). 6.5s ≈ 9 solicitudes/min.
const DELAY_MS = 6500;

if (!API_KEY) {
  console.error('Falta la variable de entorno GEMINI_API_KEY.');
  console.error('Ejecuta:  GEMINI_API_KEY=tu_clave node procesar.js');
  process.exit(1);
}

if (!fs.existsSync(DOCS_DIR)) {
  console.error(`No existe la carpeta "documentos" en ${__dirname}.`);
  console.error('Crea subcarpetas por tema, por ejemplo: documentos/Laboral/informe.pdf');
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractText(filePath) {
  const lower = filePath.toLowerCase();
  const buffer = fs.readFileSync(filePath);
  if (lower.endsWith('.pdf')) {
    const data = await pdfParse(buffer);
    return data.text;
  }
  if (lower.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  return null;
}

async function extractRecommendations(text, tema) {
  const truncated = text.length > 60000 ? text.slice(0, 60000) : text;
  const prompt = `Eres un analista que revisa documentos del Instituto Peruano de Economía (IPE) sobre el tema "${tema}".

Del siguiente texto, identifica ÚNICAMENTE las recomendaciones de política pública explícitas o propuestas concretas que se plantean (no incluyas diagnóstico, cifras de contexto ni descripciones del problema, solo la recomendación o propuesta en sí).

Devuelve EXCLUSIVAMENTE un array JSON de strings, sin texto adicional, sin backticks ni explicaciones. Cada string debe ser una recomendación concisa (máximo 30 palabras), redactada en español, sintetizada con claridad. Si el texto no contiene recomendaciones explícitas, devuelve un array vacío: []

TEXTO:
"""
${truncated}
"""`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.2 }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API respondió ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
  const raw = parts.map((p) => p.text || '').join('\n').trim();
  let cleaned = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();

  let arr;
  try {
    arr = JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\[[\s\S]*\]/);
    arr = match ? JSON.parse(match[0]) : [];
  }
  if (!Array.isArray(arr)) arr = [];
  return arr.filter((x) => typeof x === 'string' && x.trim().length > 0);
}

async function main() {
  const temas = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => fs.statSync(path.join(DOCS_DIR, f)).isDirectory());

  if (temas.length === 0) {
    console.error('No se encontraron subcarpetas de tema dentro de "documentos/".');
    console.error('Ejemplo: documentos/Laboral/informe.pdf');
    process.exit(1);
  }

  const resultado = { generadoEn: new Date().toISOString(), temas: {} };
  let totalArchivos = 0;
  let totalRecs = 0;
  const fallidos = [];

  for (const tema of temas) {
    const temaDir = path.join(DOCS_DIR, tema);
    const archivos = fs.readdirSync(temaDir).filter((f) => /\.(pdf|docx)$/i.test(f));
    resultado.temas[tema] = [];

    for (const archivo of archivos) {
      totalArchivos++;
      const filePath = path.join(temaDir, archivo);
      process.stdout.write(`[${tema}] ${archivo} ... `);
      try {
        const text = await extractText(filePath);
        if (!text || text.trim().length < 30) {
          console.log('sin texto extraíble.');
          resultado.temas[tema].push({ archivo, recomendaciones: [], nota: 'sin texto extraíble (¿PDF escaneado?)' });
        } else {
          const recs = await extractRecommendations(text, tema);
          console.log(`${recs.length} recomendación(es).`);
          resultado.temas[tema].push({ archivo, recomendaciones: recs });
          totalRecs += recs.length;
        }
      } catch (e) {
        console.log('ERROR: ' + e.message);
        fallidos.push(`${tema}/${archivo}: ${e.message}`);
        resultado.temas[tema].push({ archivo, recomendaciones: [], nota: 'error: ' + e.message });
      }
      await sleep(DELAY_MS);
    }
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(resultado, null, 2), 'utf-8');

  console.log('\n— Resumen —');
  console.log(`Archivos procesados: ${totalArchivos}`);
  console.log(`Recomendaciones encontradas: ${totalRecs}`);
  if (fallidos.length) {
    console.log(`Archivos con error (${fallidos.length}):`);
    fallidos.forEach((f) => console.log('  - ' + f));
  }
  console.log(`\nListo. Datos guardados en: ${OUT_FILE}`);
  console.log('Sube index.html y la carpeta data/ a tu repositorio para publicarlos.');
}

main();
