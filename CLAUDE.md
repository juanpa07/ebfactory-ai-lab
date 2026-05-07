# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Landing page and design system for **AI-Driven Delivery**, an eBFactory conference (Spanish-language) about using Claude in the delivery cycle. Static site built with vanilla HTML/CSS/JS — no framework, no build step beyond Vite's dev server.

## Commands

- **Dev server:** `npm run dev` — starts Vite on port 3000, opens the landing page
- **Preview:** `npm run preview` — serves a production preview

There are no tests, linters, or build scripts configured.

## Architecture

The site consists of two standalone HTML pages at the project root:

- `AI-Driven Delivery - Landing.html` — conference landing page (hero, talks, speakers, agenda, registration)
- `AI-Driven Delivery - Design System.html` — living design-system documentation page

### Styling

- **`tokens.css`** — design tokens (CSS custom properties) defining the entire visual language: colors, typography (Geist/Geist Mono), spacing, radii, shadows, breakpoints. Dark color scheme. All component styles reference these tokens.
- **`landing.css`** — all landing page component styles, built exclusively on tokens from `tokens.css`.

### JavaScript

All JS is vanilla, no bundler transforms. CDN dependencies are loaded in the HTML `<head>`:
- **GSAP + ScrollTrigger** — scroll-driven animations
- **Embla Carousel** — carousel/slider sections

Project scripts:
- **`landing.js`** — IIFE handling navbar scroll state, hero animations, terminal simulation, carousel init, registration form, and scroll-triggered reveals. Uses `$`/`$$` helpers for DOM queries.
- **`simulation-scenarios.js`** — three scripted terminal-simulation scenarios (Storybook component, Drupal content type, CI/CD pipeline) exposed as `window.__simScenarios`. Each scenario is an array of typed line objects (`prompt-user`, `claude`, `diff-add`, `diff-meta`, etc.).
- **`image-slot.js`** — `<image-slot>` custom element (Web Component) for user-fillable image placeholders with drag-and-drop, crop/reframe, and persistence via a `.image-slots.state.json` sidecar file.

### Assets

- `assets/speakers/` — speaker portrait images
- `uploads/` — pasted/uploaded images used in the pages

## Key Conventions

- All content is in **Spanish** (es). Keep all UI text, labels, and copy in Spanish.
- The design system enforces **token-only styling** — never use one-off color/spacing values; always reference `var(--token-name)` from `tokens.css`.
- The accent color (Signal Green `#3DDC84`) is used sparingly for CTAs and highlights.
- Accessibility: ARIA attributes are used on interactive elements (nav, modals, carousels). Respect `prefers-reduced-motion`.
