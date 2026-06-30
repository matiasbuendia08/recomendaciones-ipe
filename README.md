# Recomendaciones de política pública — IPE

🔗 **Página pública:** https://matiasbuendia08.github.io/recomendaciones-ipe/

---

## ¿Qué es esto?

Una página web que reúne y organiza las **recomendaciones de política pública** del IPE en un solo lugar. En vez de buscar manualmente dentro de cada informe, cualquier persona puede entrar al link y buscar recomendaciones por tema o palabra clave.

Las recomendaciones se extraen automáticamente de los informes usando inteligencia artificial (IA).

---

## ¿Cómo funciona?

El proyecto tiene dos partes:

**1. Procesamiento (se hace en la computadora, una vez por semana o cuando hay documentos nuevos)**

Se corre un script que lee los PDF e informes Word del IPE, le pide a una IA que identifique las recomendaciones, y genera un archivo de datos. Este paso lo hace el equipo internamente — los documentos originales nunca se suben a internet.

**2. Página pública (siempre disponible en el link de arriba)**

Cualquier persona con el link puede ver las recomendaciones organizadas por tema (Laboral, Minería, Competitividad, etc.) y buscar por palabra clave. No requiere contraseña ni instalar nada.

---

## ¿Qué temas cubre actualmente?

- Competitividad
- Hidrocarburos
- Laboral
- Minería
- Pobreza
- Agro
- Educación
- Inseguridad

Se pueden agregar más temas en cualquier momento incorporando nuevos documentos.

---

## ¿Cómo se actualiza?

1. Se agregan los informes nuevos a la carpeta correspondiente según tema.
2. Se corre el script de procesamiento (toma unos minutos dependiendo de la cantidad de documentos).
3. Se sube el archivo de datos actualizado a GitHub.
4. La página pública se actualiza automáticamente.

Todo el proceso toma menos de 10 minutos una vez configurado.

---

## ¿Qué tecnología usa?

- **IA:** API de Gemini (Google) o Groq — ambas tienen un nivel gratuito que cubre el volumen de documentos del IPE sin costo.
- **Página web:** GitHub Pages — hosting gratuito, sin servidor, sin costo de mantenimiento.
- **Costo total del proyecto:** $0.

---

## ¿Los documentos del IPE son públicos?

Los documentos originales ** han sido previamente publicados** para distintas revistas y periódicos como El Comercio, Gestión, etc.

---

*Desarrollado internamente con herramientas de IA. Para consultas sobre el funcionamiento técnico, contactar al equipo.*
