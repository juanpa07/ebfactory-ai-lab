# AI-Driven Delivery — Conferencia eBFactory

Conferencia virtual gratuita donde el equipo de eBFactory comparte cómo la IA se integra en cada etapa del ciclo de desarrollo de software.

**Fecha:** Mayo 15, 2026 · 4:00 PM – 5:00 PM (COT)

---

## Secciones del evento

### /01 — Del Design System al componente en minutos
**Speaker:** Santiago Gonzales · Fullstack Developer

Un design system que se documenta, prueba y refactoriza solo. Se muestra cómo Storybook + Claude + skills de arquitectura mantienen la paridad entre diseño y código con reglas claras.

**Stack:** Storybook, Claude, TypeScript

### /02 — Del componente al CMS gobernado
**Speaker:** Edwin Rincon · Fullstack Developer

Web components creados desde Storybook e integrados a Drupal. Reglas claras de arquitectura en la IA para integrar componentes, generar tipos de contenido y definir reglas de negocio en la edición de contenido.

**Stack:** Drupal, Web Components, Skills

### /03 — Del commit al multiambiente con confianza
**Speaker:** Alejandro Perez · Fullstack Developer

CI/CD con GitHub Actions que compila automáticamente el Storybook y lo despliega en un ambiente de Drupal en Pantheon, facilitando las revisiones del equipo y el cliente. Cada rama vive en su propio ambiente con su propia base de datos.

**Stack:** GitHub Actions, Pantheon, Multidev

### /04 — Cuando el equipo automatiza al equipo
**Speaker:** Alejandro Toro · Fullstack Developer

Automatización del canal de atención al cliente por WhatsApp. Claude Code controlando MCP servers, n8n orquestando — la operación se vuelve un prompt.

**Stack:** Claude Code, MCP, n8n

---

## Simulación interactiva

La landing incluye una simulación en terminal que recorre tres escenarios reales de cómo los modelos LLM colaboran con el equipo de eBFactory en proyectos de cliente: scaffolding de componentes, modelado de content types en Drupal, y orquestación de automatizaciones.

---

## Desarrollo local

```bash
npm install
npm run dev    # Vite en puerto 3000
```
