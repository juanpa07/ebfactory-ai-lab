/* ============================================================
   AI-Driven Delivery — landing page logic
   Vanilla JS + GSAP/ScrollTrigger + Embla (loaded via CDN)
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ============================================================
     NAVBAR — scrolled state + mobile menu
     ============================================================ */
  function initNav() {
    const nav = $('#lp-nav');
    const menu = $('#lp-mobile-menu');
    const burger = $('#lp-hamburger');
    const close = $('#lp-mobile-close');

    const onScroll = () => {
      nav.dataset.scrolled = window.scrollY > 80 ? 'true' : 'false';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const openMenu = () => {
      menu.dataset.open = 'true';
      menu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      menu.dataset.open = 'false';
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', openMenu);
    close.addEventListener('click', closeMenu);
    $$('[data-mobile-link]').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.dataset.open === 'true') closeMenu();
    });
  }

  /* ============================================================
     HERO — staggered word reveal + parallax glow
     ============================================================ */
  function initHero() {
    const glow = $('#lp-hero-glow');
    if (reduceMotion || !glow) return;

    // Hero entrance is CSS-driven (animations on .lp-hero__word, __pill, __lead, __date, __cta).
    // JS only enhances with the parallax glow.

    // Parallax glow — capped, gentle
    let targetX = 0, targetY = 0, curX = 0, curY = 0;
    const raf = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      requestAnimationFrame(raf);
    };
    raf();
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetX = ((e.clientX - cx) / cx) * 28;   // capped ±28px
      targetY = ((e.clientY - cy) / cy) * 18;
    });
  }

  /* ============================================================
     NARRATIVE — pinned horizontal scroll, 4 panels
     ============================================================ */
  function initPin() {
    if (typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);
    const pin    = $('#lp-pin');
    const track  = $('#lp-pin-track');
    const dots   = $$('#lp-pin-progress .lp-pin__dot');
    const panels = $$('.lp-pin__panel', track);
    if (!panels.length) return;

    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      const distance = (panels.length - 1) * window.innerWidth;

      gsap.to(track, {
        x: () => -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: reduceMotion ? false : 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: self => {
            const idx = Math.round(self.progress * (panels.length - 1));
            dots.forEach((d, i) => d.dataset.active = i === idx ? 'true' : 'false');
          }
        }
      });

      // Subtle stagger of diagrams as they enter
      if (!reduceMotion) {
        panels.forEach((panel, i) => {
          const text = panel.querySelector('.lp-pin__panel-text');
          const diag = panel.querySelector('.lp-pin__diagram');
          gsap.from([text, diag], {
            opacity: 0,
            y: 24,
            duration: 0.8,
            stagger: 0.08,
            ease: 'cubic-bezier(0.16,1,0.3,1)',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: ScrollTrigger.getById && null,
              start: 'left center',
              end: 'right center',
              toggleActions: 'play none none reverse',
            }
          });
        });
      }

      // Cleanup: runs when matchMedia no longer matches — kills triggers & removes spacer
      return () => {
        gsap.set(track, { clearProps: 'transform' });
        dots.forEach(d => d.dataset.active = 'false');
      };
    });
  }

  /* ============================================================
     SPEAKERS — Embla carousel + Radix-style modal
     ============================================================ */
  function initSpeakers() {
    const container = $('#embla-container');
    if (!container || typeof SPEAKERS === 'undefined') return;

    // Build slides — duplicate the set so Embla has enough content to loop
    const slideHTML = (s, idx) => `
      <div class="embla__slide">
        <button class="lp-speaker-card" type="button" data-speaker="${idx}" aria-label="Ver bio de ${s.name}">
          <div class="lp-speaker-card__portrait">
            ${s.photo
              ? `<img src="${s.photo}" alt="${s.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:12px;display:block;" />`
              : `<image-slot id="speaker-${s.id}" placeholder="Photo · ${s.name}" shape="rounded" radius="12"></image-slot>`}
          </div>
          <div>
            <div class="lp-speaker-card__name">${s.name}</div>
            <div class="lp-speaker-card__role">${s.role}</div>
          </div>
          <div class="lp-speaker-card__topic">
            <span class="lp-speaker-card__topic-num">/${s.talkNum}</span>
            <span>${s.topic}</span>
          </div>
        </button>
      </div>`;
    const slides = SPEAKERS.map((s, idx) => slideHTML(s, idx));
    container.innerHTML = [...slides, ...slides].join('');

    // Embla
    const viewport = $('#embla');
    const emblaApi = EmblaCarousel(viewport, {
      align: 'start',
      loop: true,
      dragFree: false,
      skipSnaps: false,
    });

    const prevBtn = $('#emb-prev');
    const nextBtn = $('#emb-next');
    prevBtn.addEventListener('click', () => emblaApi.scrollPrev());
    nextBtn.addEventListener('click', () => emblaApi.scrollNext());

    // Auto-advance every 6s, pause on hover/focus/reduced-motion
    let timer = null;
    let paused = reduceMotion;
    const tick = () => emblaApi.scrollNext();
    const start = () => { stop(); if (!paused) timer = setInterval(tick, 6000); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
    viewport.addEventListener('mouseenter', () => { paused = true; stop(); });
    viewport.addEventListener('mouseleave', () => { paused = reduceMotion; start(); });
    viewport.addEventListener('focusin',  () => { paused = true; stop(); });
    viewport.addEventListener('focusout', () => { paused = reduceMotion; start(); });
    start();

    // Click → modal
    container.addEventListener('click', e => {
      const card = e.target.closest('[data-speaker]');
      if (!card) return;
      openSpeakerModal(parseInt(card.dataset.speaker, 10), card);
    });
    // keyboard arrow nav for carousel
    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { emblaApi.scrollNext(); }
      if (e.key === 'ArrowLeft')  { emblaApi.scrollPrev(); }
    });
  }

  /* ---------- Speaker modal ---------- */
  let modalLastTrigger = null;
  function openSpeakerModal(idx, trigger) {
    const s = SPEAKERS[idx];
    if (!s) return;
    modalLastTrigger = trigger;

    const modal = $('#lp-modal');
    $('#lp-modal-name').textContent = s.name;
    $('#lp-modal-role').textContent = s.role;
    const bio = $('#lp-modal-bio');
    bio.innerHTML = s.bio.map(p => `<p class="lp-modal__bio">${p}</p>`).join('');
    $('#lp-modal-talk-title').textContent = s.topic;
    $('#lp-modal-talk-time').textContent  = `/${s.talkNum} · ${s.talkTime}`;
    $('#lp-modal-talk').setAttribute('href', `#agenda`);

    // Portrait — use saved asset if present, else image-slot for drop-in
    const portrait = $('#lp-modal-portrait');
    portrait.innerHTML = s.photo
      ? `<img src="${s.photo}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />`
      : `<image-slot id="speaker-${s.id}" placeholder="Photo · ${s.name}" shape="rect"></image-slot>`;

    // Socials (TODO: real URLs)
    $('#lp-modal-socials').innerHTML = `
      <a class="lp-modal__social" href="#" aria-label="LinkedIn de ${s.name}" data-todo="real-url">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>
      </a>
      <a class="lp-modal__social" href="#" aria-label="GitHub de ${s.name}" data-todo="real-url">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 6.77 5.07 5.07 0 0 0 19.91 3S18.73 2.65 16 4.55a13.38 13.38 0 0 0-7 0C6.27 2.65 5.09 3 5.09 3A5.07 5.07 0 0 0 5 6.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 20.13V24"/></svg>
      </a>
      <a class="lp-modal__social" href="#" aria-label="Twitter / X de ${s.name}" data-todo="real-url">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l16 16M20 4L4 20"/></svg>
      </a>
      <a class="lp-modal__social" href="#" aria-label="Sitio personal de ${s.name}" data-todo="real-url">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c3 4 3 16 0 20M12 2c-3 4-3 16 0 20"/></svg>
      </a>
    `;

    modal.dataset.open = 'true';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus management
    setTimeout(() => $('#lp-modal-close').focus(), 50);
  }
  function closeSpeakerModal() {
    const modal = $('#lp-modal');
    modal.dataset.open = 'false';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalLastTrigger) modalLastTrigger.focus();
  }
  function initModal() {
    const modal = $('#lp-modal');
    $('#lp-modal-close').addEventListener('click', closeSpeakerModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeSpeakerModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.dataset.open === 'true') closeSpeakerModal();
      if (e.key === 'Tab' && modal.dataset.open === 'true') {
        // Simple focus trap
        const focusables = $$('a, button, input, [tabindex]:not([tabindex="-1"])', modal);
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ============================================================
     AGENDA — staggered scroll reveal
     ============================================================ */
  function initAgendaReveal() {
    const rows = $$('.lp-timeline__row');
    if (reduceMotion) { rows.forEach(r => r.dataset.revealed = 'true'); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.row || '0', 10);
          setTimeout(() => entry.target.dataset.revealed = 'true', idx * 60);
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    rows.forEach(r => io.observe(r));
  }

  /* ============================================================
     SIMULATION — auto-typing terminal + live preview
     ============================================================ */
  function initSimulation() {
    const scenarios = window.__simScenarios || [];
    if (!scenarios.length) return;

    const term     = $('#lp-term-body');
    const termTitle = $('#lp-term-title');
    const previewUrl = $('#lp-prev-url');
    const empty    = $('#lp-prev-empty');
    const stage    = $('#lp-prev-stage');
    const stepDots = $$('.lp-sim__step-dot');
    const prevBtn  = $('#sim-prev');
    const nextBtn  = $('#sim-next');
    const toggle   = $('#sim-toggle');
    const toggleLbl = $('#sim-toggle-label');
    const previews = {
      testimonial: $('#sim-testimonial'),
      drupal:      $('#sim-drupal'),
      graph:       $('#sim-graph'),
    };

    let current = 0;
    let playing = !reduceMotion;
    let runToken = 0;          // cancellation token for in-flight typing
    let scheduled = null;

    if (reduceMotion) toggleLbl.textContent = '▶ Reproducir';

    const wait = ms => new Promise(r => {
      const t = setTimeout(r, ms);
      // store on the scheduled chain so cancel can drop it
      return t;
    });
    const cancellable = (ms, token) => new Promise((resolve, reject) => {
      const start = Date.now();
      const t = setTimeout(() => {
        if (token !== runToken) reject('cancelled');
        else resolve();
      }, ms);
    });

    function clearTerm() { term.innerHTML = ''; }
    function hidePreviews() {
      Object.values(previews).forEach(p => { p.dataset.show = 'false'; p.hidden = true; });
      if (empty) empty.style.display = '';
    }
    function showPreview(target) {
      if (empty) empty.style.display = 'none';
      const p = previews[target];
      if (!p) return;
      p.hidden = false;
      // Force a frame so the transition fires
      requestAnimationFrame(() => p.dataset.show = 'true');

      // Drupal field stagger
      if (target === 'drupal') {
        $$('.sim-drupal__field', p).forEach((f, i) => {
          setTimeout(() => f.dataset.show = 'true', 180 + i * 110);
        });
      }
    }

    function appendLine(kindClass, html) {
      const line = document.createElement('div');
      line.className = 'lp-term__line ' + kindClass;
      line.innerHTML = html;
      term.appendChild(line);
      term.scrollTop = term.scrollHeight;
      return line;
    }

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    async function typeInto(line, text, charDelay, token) {
      // Append a caret while typing
      const caret = document.createElement('span');
      caret.className = 'lp-term__caret';
      line.appendChild(caret);
      for (let i = 0; i < text.length; i++) {
        if (token !== runToken) return;
        caret.before(document.createTextNode(text[i]));
        // Reduce per-char delay slightly for whitespace/punctuation
        const delay = /\s/.test(text[i]) ? charDelay * 0.5 : charDelay;
        await new Promise(r => setTimeout(r, delay));
        term.scrollTop = term.scrollHeight;
      }
      caret.remove();
    }

    async function runScenario(idx) {
      runToken++;
      const token = runToken;
      const scenario = scenarios[idx];
      if (!scenario) return;
      current = idx;
      stepDots.forEach((d, i) => d.dataset.active = i === idx ? 'true' : 'false');
      termTitle.innerHTML = `<strong>${escapeHtml(scenario.terminalTitle)}</strong>`;
      previewUrl.textContent = `~/preview · ${scenario.label.toLowerCase()}`;

      clearTerm();
      hidePreviews();

      // Initial prompt prefix
      for (const block of scenario.lines) {
        if (token !== runToken) return;

        if (block.kind === 'spacer') {
          appendLine('', '<br/>');
          await new Promise(r => setTimeout(r, 120));
          continue;
        }
        if (block.kind === 'preview-show') {
          showPreview(block.target);
          await new Promise(r => setTimeout(r, 600));
          continue;
        }

        let prefix = '';
        let cls = '';
        let text = block.text;
        let charDelay = 14;

        switch (block.kind) {
          case 'prompt-user':
            prefix = '<span class="lp-term__prompt">&gt; </span>';
            cls = 'lp-term__user';
            charDelay = 38;
            break;
          case 'skill':
            cls = 'lp-term__skill';
            charDelay = 8;
            break;
          case 'claude':
            cls = 'lp-term__claude';
            charDelay = 14;
            break;
          case 'meta':
            cls = 'lp-term__diff-meta';
            charDelay = 6;
            break;
          case 'diff-meta':
            cls = 'lp-term__diff-meta';
            charDelay = 6;
            break;
          case 'diff-add':
            cls = 'lp-term__diff-add';
            charDelay = 4;
            break;
          case 'diff-rm':
            cls = 'lp-term__diff-rm';
            charDelay = 4;
            break;
          default:
            cls = '';
        }

        const line = appendLine(cls, prefix);

        if (reduceMotion) {
          // Skip animation: drop the full line in
          line.innerHTML = prefix + escapeHtml(text);
          term.scrollTop = term.scrollHeight;
          continue;
        }
        await typeInto(line, text, charDelay, token);
        if (token !== runToken) return;
        // small pause between lines based on kind
        const pause = block.kind === 'prompt-user' ? 420
                    : block.kind === 'skill' ? 260
                    : block.kind === 'claude' ? 220
                    : 60;
        await new Promise(r => setTimeout(r, pause));
      }

      // Auto-advance to next scenario after a beat (only when playing)
      if (token === runToken && playing) {
        scheduled = setTimeout(() => {
          if (token === runToken) runScenario((idx + 1) % scenarios.length);
        }, 4000);
      }
    }

    function gotoScenario(idx) {
      if (scheduled) { clearTimeout(scheduled); scheduled = null; }
      runScenario(((idx % scenarios.length) + scenarios.length) % scenarios.length);
    }

    stepDots.forEach(dot => {
      dot.addEventListener('click', () => gotoScenario(parseInt(dot.dataset.step, 10)));
    });
    prevBtn.addEventListener('click', () => { playing = false; toggleLbl.textContent = '▶ Auto'; gotoScenario(current - 1); });
    nextBtn.addEventListener('click', () => { playing = false; toggleLbl.textContent = '▶ Auto'; gotoScenario(current + 1); });
    toggle.addEventListener('click', () => {
      playing = !playing;
      toggleLbl.textContent = playing ? '⏸ Pausar' : '▶ Auto';
      if (playing) {
        gotoScenario(current);
      } else if (scheduled) {
        clearTimeout(scheduled); scheduled = null;
      }
    });

    // Start when scrolled into view (so user sees the typing fresh)
    let started = false;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !started) {
          started = true;
          if (reduceMotion) {
            // Render scenario 0 fully without typing
            playing = false;
            toggleLbl.textContent = '▶ Reproducir';
          }
          runScenario(0);
        }
      });
    }, { threshold: 0.25 });
    io.observe($('.lp-sim__panel'));
  }

  /* ============================================================
     COUNTDOWN — Mayo 15, 2026 · 4:00 PM COT (America/Bogota, UTC-5)
     ============================================================ */
  function initCountdown() {
    const elDays  = $('#lp-cd-days');
    const elHours = $('#lp-cd-hours');
    const elMins  = $('#lp-cd-mins');
    const elSecs  = $('#lp-cd-secs');
    const elLive  = $('#lp-countdown-live');
    const elLocal = $('#lp-countdown-local');
    if (!elDays) return;

    // 4:00 PM COT = UTC-5 → 21:00 UTC
    const EVENT_UTC = new Date('2026-05-15T21:00:00.000Z');

    // Show the user's local equivalent of the event time
    try {
      const localStr = new Intl.DateTimeFormat(undefined, {
        weekday:      'short',
        month:        'short',
        day:          'numeric',
        hour:         'numeric',
        minute:       '2-digit',
        hour12:       true,
        timeZoneName: 'short',
      }).format(EVENT_UTC);
      const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isCOT  = userTZ === 'America/Bogota';
      if (!isCOT) elLocal.textContent = `Tu hora local: ${localStr}`;
    } catch (_) { /* Intl not available */ }

    function pad(n) { return String(n).padStart(2, '0'); }

    function setNum(el, val) {
      const str = pad(val);
      if (el.textContent === str) return;
      if (!reduceMotion) {
        el.classList.remove('lp-countdown__num--flip');
        void el.offsetWidth; // reflow to restart animation
        el.classList.add('lp-countdown__num--flip');
      }
      el.textContent = str;
    }

    const forceLive = new URLSearchParams(location.search).has('live');

    function tick() {
      const diff = forceLive ? 0 : EVENT_UTC.getTime() - Date.now();

      if (diff <= 0) {
        const grid    = $('#lp-countdown .lp-countdown__grid');
        const header  = $('#lp-countdown .lp-countdown__header');
        const tagline = $('#lp-countdown-tagline');
        if (grid)    grid.hidden    = true;
        if (header)  header.hidden  = true;
        if (tagline) tagline.hidden = true;
        if (elLive) elLive.dataset.visible = 'true';
        return; // stop
      }

      const totalSecs = Math.floor(diff / 1000);
      setNum(elDays,  Math.floor(totalSecs / 86400));
      setNum(elHours, Math.floor(totalSecs / 3600) % 24);
      setNum(elMins,  Math.floor(totalSecs / 60)   % 60);
      setNum(elSecs,  totalSecs                     % 60);

      setTimeout(tick, 1000);
    }

    tick();
  }

  /* ============================================================
     CTA FORM — placeholder handler
     ============================================================ */
  function initForm() {
    const form     = $('#lp-cta-form');
    const note     = $('#lp-cta-note');
    const backdrop = $('#lp-yt-modal');
    const iframe   = $('#lp-yt-iframe');
    const closeBtn = $('#lp-yt-close');
    if (!form) return;

    const YT_SRC = 'https://www.youtube.com/embed/hkV7FjivJ7U?autoplay=1&rel=0';

    function openYT() {
      if (!backdrop || !iframe) return;
      iframe.src = YT_SRC;
      backdrop.dataset.open = 'true';
      backdrop.removeAttribute('aria-hidden');
      document.body.style.overflow = 'hidden';
      closeBtn && closeBtn.focus();
    }

    function closeYT() {
      if (!backdrop || !iframe) return;
      backdrop.dataset.open = 'false';
      backdrop.setAttribute('aria-hidden', 'true');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value.trim();
      // Simple validation
      const valid = /.+@.+\..+/.test(email);
      if (!valid) {
        note.textContent = 'Hmm, ese correo no parece válido. Intenta de nuevo.';
        note.style.color = 'var(--status-error)';
        return;
      }
      // TODO: wire to real submission endpoint
      // TODO: send analytics event (e.g. 'reservation_started')
      note.textContent = `¡Listo! Reservaremos tu lugar para ${email}. Te llegará el link 24h antes.`;
      note.style.color = 'var(--accent-500)';
      form.querySelector('input').value = '';
      openYT();
    });

    closeBtn && closeBtn.addEventListener('click', closeYT);
    backdrop && backdrop.addEventListener('click', e => { if (e.target === backdrop) closeYT(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && backdrop && backdrop.dataset.open === 'true') closeYT();
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initNav();
    initHero();
    initPin();
    initSpeakers();
    initModal();
    initAgendaReveal();
    initCountdown();
    initSimulation();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
