# Recomendaciones de política pública — IPE

Página pública que muestra las recomendaciones de política pública identificadas en los informes del Instituto Peruano de Economía (IPE), organizadas por tema y buscables por palabra clave.

El proyecto tiene **dos partes separadas**:

1. **Procesamiento** (`procesar.js`) — un script que corres en tu propia computadora, las veces que quieras, para convertir tus PDF/Word en un archivo de datos (`data/recomendaciones.json`). Usa tu propia clave **gratuita** de la API de Gemini (Google). No depende de nadie más una vez configurado.
2. **Página pública** (`index.html`) — lo que ve cualquier visitante. Es 100% estática: solo lee `data/recomendaciones.json` y lo muestra. No tiene botón de subir archivos, no necesita ninguna clave, no le cuesta nada a nadie que la visite.

## Antes de empezar: consigue tu clave gratuita de Gemini

1. Entra a [Google AI Studio](https://aistudio.google.com/apikey) con tu cuenta de Google.
2. Genera una API key (no pide tarjeta de crédito).
3. Guárdala en un lugar seguro — la vas a usar solo en tu computadora, nunca se sube a GitHub.

El nivel gratuito de Gemini (modelos "Flash") permite alrededor de **1,500 solicitudes por día**, muy por encima de lo que necesitas para 50+ documentos. Los límites de Google cambian de tanto en tanto — si en algún momento el script falla con un error de cuota, revisa los límites vigentes en [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits).

## Parte 1 — Procesar tus documentos (en tu computadora)

### Requisitos

- [Node.js](https://nodejs.org/) versión 18 o superior instalado en tu computadora.

### Pasos

1. Descarga/clona esta carpeta en tu computadora.
2. Instala las dependencias (solo la primera vez):
   ```
   npm install
   ```
3. Organiza tus documentos en una carpeta llamada `documentos/`, con una subcarpeta por cada tema. El nombre de la subcarpeta es el tema:
   ```
   documentos/
     Laboral/
       informe1.pdf
       informe2.docx
     Hidrocarburos/
       informe3.pdf
     Educacion/
       informe4.pdf
   ```
4. Corre el script, pasando tu clave de Gemini como variable de entorno:

   **macOS / Linux:**
   ```
   GEMINI_API_KEY=tu_clave_aqui node procesar.js
   ```

   **Windows (PowerShell):**
   ```
   $env:GEMINI_API_KEY="tu_clave_aqui"; node procesar.js
   ```

   **Windows (cmd):**
   ```
   set GEMINI_API_KEY=tu_clave_aqui && node procesar.js
   ```

5. Espera a que termine — verás el progreso archivo por archivo en la terminal (con 50+ documentos, toma varios minutos, ya que el script espera unos segundos entre cada uno para respetar el límite gratuito).
6. Al terminar, se genera/actualiza `data/recomendaciones.json`. Ese es el archivo que alimenta la página pública.

Puedes volver a correr este script cuando quieras — por ejemplo, cada vez que agregues documentos nuevos a las carpetas de `documentos/`. Vuelve a procesar todo y sobrescribe `data/recomendaciones.json`.

> Nota: `documentos/` está en `.gitignore` a propósito — tus archivos originales se quedan solo en tu computadora, no se suben a GitHub.

## Parte 2 — Publicar la página pública en GitHub Pages

1. Crea un repositorio nuevo en GitHub (público).
2. Sube **`index.html`**, la carpeta **`data/`** (con el `recomendaciones.json` ya generado) y este **`README.md`** a la raíz del repositorio. No subas `documentos/`, `node_modules/` ni tu clave — el `.gitignore` ya los excluye si usas `git`.
3. Ve a **Settings → Pages**.
4. En "Build and deployment", elige **Deploy from a branch**, selecciona la rama `main` y la carpeta `/ (root)`.
5. Guarda. GitHub te da una URL como `https://tu-usuario.github.io/tu-repositorio/` (tarda 1-2 minutos en activarse la primera vez).
6. Cualquiera con ese link puede ver las recomendaciones — nadie necesita subir nada ni tener ninguna clave.

### Para actualizar la página más adelante

Cuando proceses documentos nuevos (Parte 1), solo necesitas volver a subir el `data/recomendaciones.json` actualizado a GitHub (reemplazando el anterior). La página pública se actualiza sola, sin tocar nada más.

## Contenido del repositorio

| Archivo | Para qué sirve | ¿Se sube a GitHub? |
|---|---|---|
| `index.html` | Página pública que muestra las recomendaciones | Sí |
| `data/recomendaciones.json` | Los datos que muestra la página (generados por `procesar.js`) | Sí |
| `procesar.js` | Script que genera `data/recomendaciones.json` a partir de tus documentos | Sí (es solo código, no contiene tu clave) |
| `package.json` | Lista de dependencias del script | Sí |
| `.gitignore` | Evita subir `documentos/`, `node_modules/` y tu clave | Sí |
| `.env.example` | Plantilla de referencia para tu clave (no es tu clave real) | Sí |
| `documentos/` | Tus PDF/Word originales | **No** |
| `node_modules/` | Dependencias instaladas por npm | **No** |

## Cómo funciona la extracción de recomendaciones

`procesar.js` lee el texto de cada PDF/Word y le pide a un modelo de IA (Gemini, en su nivel gratuito) que identifique y resuma únicamente las recomendaciones de política pública del documento — no el diagnóstico ni las cifras de contexto. El resultado son frases cortas y sintetizadas, cada una junto al nombre del documento de origen.

Como toda extracción asistida por IA, conviene revisar el documento original antes de citar una recomendación en un informe o nota formal.

## Formatos soportados

- PDF con texto seleccionable (no funciona con PDF escaneados/imágenes sin OCR).
- Word `.docx` (no `.doc` antiguo — conviértelo a `.docx` primero si es necesario).

## Privacidad

- Tus documentos originales nunca salen de tu computadora más que hacia la API de Gemini durante el procesamiento (Parte 1), que tú controlas con tu propia clave.
- La página pública (Parte 2) no recibe ni procesa ningún archivo — solo muestra el resultado ya generado.
