/* ============================================================
   Simulation scenarios — fully scripted, no LLM calls
   Exposes window.__simScenarios = [ { ... }, { ... }, { ... } ]
   ============================================================ */
(function () {
  const PROMPT = '> ';

  /* ---------------- Scenario A: Storybook component ---------------- */
  const A = {
    id: 'A',
    label: 'Componente Storybook',
    title: 'Generar componente con stories y tests',
    terminalTitle: 'terminal-code · ~/projects/cliente-bid',
    preview: 'testimonial',
    lines: [
      { kind: 'prompt-user', text: 'Necesito un componente de testimonios siguiendo nuestro design system, con stories y tests.' },
      { kind: 'spacer' },
      { kind: 'skill', text: '⚡ Skill invoked: design-system/component-scaffold' },
      { kind: 'claude', text: 'Reviso el design system y los componentes existentes…' },
      { kind: 'meta', text: '  ↳ tokens: bg-secondary, border-subtle, radius-lg' },
      { kind: 'meta', text: '  ↳ patrón base: card.tsx (línea 1-84)' },
      { kind: 'spacer' },
      { kind: 'claude', text: 'Genero el componente, sus stories y dos tests (default + long-quote).' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'src/components/cc-testimonials/cc-testimonials.tsx' },
      { kind: 'diff-add', text: '+ export interface TestimonialProps {' },
      { kind: 'diff-add', text: '+   quote: string;' },
      { kind: 'diff-add', text: '+   author: { name: string; role: string; avatar?: string };' },
      { kind: 'diff-add', text: '+ }' },
      { kind: 'diff-add', text: '+ export const Testimonial: FC<TestimonialProps> = ({ quote, author }) => (' },
      { kind: 'diff-add', text: '+   <Card variant="default" className="testimonial">' },
      { kind: 'diff-add', text: '+     <p className="testimonial__quote">{quote}</p>' },
      { kind: 'diff-add', text: '+     <Author {...author} />' },
      { kind: 'diff-add', text: '+   </Card>' },
      { kind: 'diff-add', text: '+ );' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'src/components/cc-testimonials/cc-testimonials.stories.tsx' },
      { kind: 'diff-add', text: '+ export const Default = { args: { quote: "Migramos en 4 sprints…", author: { name: "Andrea Ríos", role: "CTO" } } };' },
      { kind: 'diff-add', text: '+ export const LongQuote = { args: { quote: lorem(58), author: ... } };' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'src/components/cc-testimonials/cc-testimonials.test.tsx · 6 assertions' },
      { kind: 'diff-add', text: '+ ✓ renders quote and author' },
      { kind: 'diff-add', text: '+ ✓ a11y: cita marcada con <blockquote>' },
      { kind: 'spacer' },
      { kind: 'claude', text: 'Listo. Storybook actualizado, 6/6 tests en verde.' },
      { kind: 'preview-show', target: 'testimonial' }
    ]
  };

  /* ---------------- Scenario B: Drupal content type ---------------- */
  const B = {
    id: 'B',
    label: 'Drupal content type',
    title: 'Modelar content type editable en 3 idiomas',
    terminalTitle: 'terminal-code · ~/projects/cliente-bid',
    preview: 'drupal',
    lines: [
      { kind: 'prompt-user', text: 'Modela el content type para que este componente sea editable y traducible a 3 idiomas.' },
      { kind: 'spacer' },
      { kind: 'skill', text: '⚡ Skill invoked: drupal/content-type-modeler' },
      { kind: 'claude', text: 'Inspecciono el componente y mapeo cada prop a un campo Drupal traducible.' },
      { kind: 'meta', text: '  ↳ idiomas: es, en, pt-br' },
      { kind: 'meta', text: '  ↳ módulo destino: drupal/modules/custom/cc_testimonials' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'cc_testimonials.info.yml' },
      { kind: 'diff-add', text: '+ name: CC Testimonials' },
      { kind: 'diff-add', text: '+ type: module' },
      { kind: 'diff-add', text: '+ core_version_requirement: ^10' },
      { kind: 'diff-add', text: '+ dependencies:' },
      { kind: 'diff-add', text: '+   - drupal:content_translation' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'config/install/node.type.testimonial.yml' },
      { kind: 'diff-add', text: '+ name: Testimonio' },
      { kind: 'diff-add', text: '+ third_party_settings:' },
      { kind: 'diff-add', text: '+   content_translation:' },
      { kind: 'diff-add', text: '+     enabled: true' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'config/install/field.field.node.testimonial.field_quote.yml' },
      { kind: 'diff-add', text: '+ field_name: field_quote' },
      { kind: 'diff-add', text: '+ type: text_long' },
      { kind: 'diff-add', text: '+ translatable: true' },
      { kind: 'spacer' },
      { kind: 'claude', text: '4 campos creados, todos traducibles. Importa con drush cim.' },
      { kind: 'preview-show', target: 'drupal' }
    ]
  };

  /* ---------------- Scenario C: n8n workflow ---------------- */
  const C = {
    id: 'C',
    label: 'Workflow n8n',
    title: 'Optimizar workflow de monitoreo',
    terminalTitle: 'terminal-code · ~/automations/uptime',
    preview: 'graph',
    lines: [
      { kind: 'prompt-user', text: 'Analiza este workflow de monitoreo y propón optimizaciones.' },
      { kind: 'spacer' },
      { kind: 'skill', text: '⚡ Skill invoked: n8n/workflow-analyst (vía MCP)' },
      { kind: 'claude', text: 'Cargo workflow.json desde el MCP server de n8n…' },
      { kind: 'meta', text: '  ↳ 7 nodos, ejecuciones/24h: 1,440 · errores: 12' },
      { kind: 'spacer' },
      { kind: 'claude', text: 'Detecto tres problemas:' },
      { kind: 'meta', text: '  1. Webhook → HTTP en serie · alta latencia (avg 4.1s)' },
      { kind: 'meta', text: '  2. Sin retry en el nodo Whatsapp · 12 fallos silenciosos' },
      { kind: 'meta', text: '  3. Filtro evaluado en cada ejecución, podría ir antes' },
      { kind: 'spacer' },
      { kind: 'claude', text: 'Propongo: paralelizar HTTP, mover filtro al inicio, agregar retry.' },
      { kind: 'spacer' },
      { kind: 'diff-meta', text: 'workflow.json · 3 cambios' },
      { kind: 'diff-rm',  text: '- "executeOrder": "sequential"' },
      { kind: 'diff-add', text: '+ "executeOrder": "parallel"' },
      { kind: 'diff-add', text: '+ "onError": { "retry": { "maxTries": 3, "waitBetween": 2000 } }' },
      { kind: 'spacer' },
      { kind: 'claude', text: 'Latencia esperada: 4.1s → 1.4s. Errores: ~0.' },
      { kind: 'preview-show', target: 'graph' }
    ]
  };

  window.__simScenarios = [A, B, C];
})();
