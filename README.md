# Buscador de recomendaciones de política pública — IPE

Herramienta web de una sola página (`index.html`) para subir informes del Instituto Peruano de Economía (Word y PDF), etiquetarlos por tema, y filtrar las frases que tienen forma de recomendación de política pública, junto con el documento de origen.

**No usa ninguna API ni servidor.** Todo el procesamiento —lectura de archivos, extracción de texto y búsqueda de recomendaciones— ocurre en el navegador del usuario. Por eso se puede alojar como página estática en GitHub Pages sin configuración adicional ni claves de ningún tipo.

## Contenido del repositorio

- `index.html` — la aplicación completa (HTML, CSS y JavaScript en un solo archivo). Carga dos librerías externas vía CDN para leer archivos:
  - [pdf.js](https://mozilla.github.io/pdf.js/) (Mozilla) para extraer texto de PDF.
  - [mammoth.js](https://github.com/mwilliamson/mammoth.js) para extraer texto de Word (`.docx`).
- `README.md` — este archivo.

No hay paso de build ni dependencias que instalar: es HTML estático.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado; si es privado necesitas plan de pago para Pages, así que lo más simple es público).
2. Sube `index.html` y `README.md` a la raíz del repositorio (arrastrándolos en la interfaz web de GitHub, o con `git add` / `git commit` / `git push` si usas la terminal).
3. Ve a **Settings → Pages** dentro del repositorio.
4. En "Build and deployment", elige **Deploy from a branch**, selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
5. Guarda. GitHub te dará una URL parecida a `https://tu-usuario.github.io/tu-repositorio/` (tarda 1-2 minutos en activarse la primera vez).
6. Listo: cualquiera con ese link puede usar la herramienta directamente desde su navegador.

## Cómo se usa

1. **Subir y etiquetar**: arrastra tus archivos `.pdf` o `.docx` al cuadro de carga. Se procesan automáticamente al subirlos. Para cada archivo puedes escribir:
   - **Tema**: la categoría del documento (hay sugerencias predefinidas — Hidrocarburos, Minería, Laboral, Educación, Fiscal, Salud, Infraestructura, Macroeconomía — y puedes escribir cualquier otro tema nuevo).
   - **Etiquetas extra** (opcional): cualquier dato adicional que te sirva para filtrar después, separado por comas (por ejemplo: `2023, informe trimestral`).
2. **Buscar recomendaciones**: selecciona un tema en el filtro (o "Todos los temas" para verlos agrupados) y, si quieres, activa alguna etiqueta extra. Verás las frases candidatas a recomendación de cada documento que coincide con el filtro.
3. **Descargar resultados**: el botón "Descargar resultados (.md)" exporta exactamente lo que está filtrado en pantalla, en un archivo Markdown.

## Cómo funciona la búsqueda (importante)

Esta herramienta **no usa inteligencia artificial**. La detección de recomendaciones es por reglas y palabras clave:

- Ubica las zonas del texto cercanas a encabezados como "Recomendaciones", "se recomienda", "propuestas de política", etc.
- Dentro de esas zonas, y en el resto del documento, identifica oraciones que contienen marcadores típicos de una recomendación ("se recomienda", "debería", "es necesario", "conviene", "urge", etc.).
- Muestra esas oraciones **tal como aparecen en el texto original** (recortadas si son muy largas) — no las reescribe ni resume.

Esto significa que:
- Puede **omitir** recomendaciones redactadas de forma poco explícita o sin esas palabras clave.
- Puede **incluir** alguna frase que mencione esas palabras sin ser realmente una recomendación.
- Siempre conviene revisar el documento original antes de citar una recomendación en un informe o nota formal.

## Formatos soportados

- PDF con texto seleccionable (no funciona con PDF escaneados/imágenes sin OCR).
- Word `.docx` (no `.doc` antiguo — conviértelo a `.docx` primero si es necesario).

## Privacidad

Ningún archivo ni texto se sube a internet. La única conexión externa que hace la página es para cargar las dos librerías (pdf.js y mammoth.js) desde su CDN público (cdnjs.cloudflare.com) la primera vez que se abre.
