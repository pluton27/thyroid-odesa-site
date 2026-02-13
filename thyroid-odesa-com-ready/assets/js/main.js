/* Main JS for the thyroid-surgery landing (UA)
   - Theme toggle (auto/light/dark)
   - Mobile navigation
   - Reveal on scroll
   - Thyroid illustration modes
   - Symptom quick-check (educational only)
*/

(() => {
  // Mark JS enabled (for graceful reveal animations)
  document.documentElement.classList.add('js');

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ----------------------------
  // Sync CSS var with real header height (better anchor offsets)
  // ----------------------------
  const headerEl = document.querySelector('.site-header');
  const syncHeaderH = () => {
    if (!headerEl) return;
    document.documentElement.style.setProperty('--headerRealH', `${headerEl.offsetHeight}px`);
  };
  syncHeaderH();
  window.addEventListener('resize', () => requestAnimationFrame(syncHeaderH));

  // ----------------------------
  // Footer year
  // ----------------------------
  const y = $('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  // ----------------------------
  // Theme (auto/light/dark)
  // ----------------------------
  const THEME_KEY = 'thyroidSiteTheme';
  const html = document.documentElement;

  const applyTheme = (mode) => {
    html.setAttribute('data-theme', mode);
  };

  const loadTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
    return 'auto';
  };

  const saveTheme = (mode) => localStorage.setItem(THEME_KEY, mode);

  const cycleTheme = (current) => {
    // cycle: auto -> dark -> light -> auto
    if (current === 'auto') return 'dark';
    if (current === 'dark') return 'light';
    return 'auto';
  };

  applyTheme(loadTheme());

  const themeBtn = $('[data-theme-toggle]');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'auto';
      const next = cycleTheme(current);
      applyTheme(next);
      saveTheme(next);
      const label = next === 'auto' ? 'Тема: авто' : (next === 'dark' ? 'Тема: темна' : 'Тема: світла');
      themeBtn.setAttribute('title', label);
    });
  }

  // ----------------------------
  // Mobile navigation
  // ----------------------------
  const navToggle = $('[data-nav-toggle]');
  const navList = $('[data-nav-list]');

  const closeNav = () => {
    if (!navList || !navToggle) return;
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const openNav = () => {
    if (!navList || !navToggle) return;
    navList.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });

    // close on outside click (mobile)
    document.addEventListener('click', (e) => {
      if (!navList.classList.contains('is-open')) return;
      const within = navList.contains(e.target) || navToggle.contains(e.target);
      if (!within) closeNav();
    });

    // close on link/button click
    $$('a, button', navList).forEach(el => el.addEventListener('click', closeNav));
  }



  // ----------------------------
  // Scrollspy (highlight current section)
  // ----------------------------
  const spyLinks = $$('a[href^="#"]', navList || document);
  const qnavLinks = $$('a.qnav[href^="#"]');
  const allSpyLinks = [...spyLinks, ...qnavLinks];

  const linkById = new Map();
  allSpyLinks.forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (!href.startsWith('#')) return;
    const id = href.slice(1);
    if (!id) return;
    linkById.set(id, linkById.get(id) ? [...linkById.get(id), a] : [a]);
  });

  const targets = [];
  linkById.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) targets.push(el);
  });

  const setActive = (id) => {
    allSpyLinks.forEach((a) => a.classList.remove('is-active'));
    const links = linkById.get(id);
    if (links) links.forEach((a) => a.classList.add('is-active'));
  };

  if ('IntersectionObserver' in window && targets.length) {
    const ioSpy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: '-45% 0px -52% 0px', threshold: 0.01 });
    targets.forEach((el) => ioSpy.observe(el));
  }
// Reveal on scroll
  // ----------------------------
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ----------------------------
  // Thyroid illustration modes
  // ----------------------------
  const thyroidGroup = $('#thyroid');
  const thyroidLabel = $('#thyLabel');
  const thyroidCaption = $('#thyroidCaption');
  const segBtns = $$('[data-thyroid-state]');

  const STATES = {
    normal: {
      className: 'state-normal',
      label: 'Норма — залоза маленька, часто не «відчувається».',
      caption: '<strong>Норма:</strong> щитоподібна залоза розташована спереду на шиї та виробляє гормони T3/T4, які впливають на енергію, вагу, серце та температуру тіла.'
    },
    nodule: {
      className: 'state-nodule',
      label: 'Вузол — часто доброякісний, але інколи потребує пункції (FNA).',
      caption: '<strong>Вузол:</strong> більшість вузлів — доброякісні та не потребують операції. Оцінка за УЗД + (за показаннями) тонкоголкова пункція допомагає визначити тактику.'
    },
    goiter: {
      className: 'state-goiter',
      label: 'Зоб — збільшення залози. Важливо з’ясувати причину та функцію (аналізи).',
      caption: '<strong>Зоб:</strong> це збільшення щитоподібної. Якщо здавлює трахею/стравохід (дихання/ковтання) або є підозрілі ознаки — може знадобитися хірургічне лікування.'
    },
    inflammation: {
      className: 'state-inflammation',
      label: 'Запалення — може давати біль у шиї, інколи після вірусної інфекції.',
      caption: '<strong>Запалення:</strong> тиреоїдит може супроводжуватися болем, дискомфортом і тимчасовими змінами гормонів. Потрібні аналізи та спостереження.'
    }
  };

  const setState = (key) => {
    if (!thyroidGroup || !STATES[key]) return;

    // remove other states
    Object.values(STATES).forEach(s => thyroidGroup.classList.remove(s.className));
    thyroidGroup.classList.add(STATES[key].className);

    if (thyroidLabel) thyroidLabel.textContent = STATES[key].label;
    if (thyroidCaption) thyroidCaption.innerHTML = STATES[key].caption;

    segBtns.forEach(btn => {
      const active = btn.getAttribute('data-thyroid-state') === key;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => setState(btn.getAttribute('data-thyroid-state')));
  });

  // ----------------------------
  // Symptom quick-check (educational)
  // ----------------------------
  const symptomForm = $('[data-symptom-form]');
  const symptomResult = $('[data-symptom-result]');
  const analyzeBtn = $('[data-symptom-analyze]');

  // scoring helpers
  const weights = {
    hypo: new Set(['fatigue', 'cold', 'weightGain', 'constipation']),
    hyper: new Set(['heat', 'palpitations', 'tremor', 'weightLoss']),
    structural: new Set(['neckLump', 'swallow', 'voice']),
    inflammation: new Set(['pain'])
  };

  const buildResult = ({hypo, hyper, structural, inflammation, selected}) => {
    const total = selected.length || 1;
    const pct = (n) => Math.round((n / total) * 100);

    // pick the top 1-2 directions
    const buckets = [
      { key: 'hypo', title: 'Можливі ознаки гіпотиреозу', n: hypo, tip: 'Зазвичай починають з аналізів TSH і вільного T4.' },
      { key: 'hyper', title: 'Можливі ознаки гіпертиреозу', n: hyper, tip: 'Зазвичай потрібні TSH, T4 (інколи T3) та уточнення причини.' },
      { key: 'structural', title: 'Можливі ознаки вузла/зоба', n: structural, tip: 'УЗД шиї — ключове. За показаннями роблять пункцію (FNA).' },
      { key: 'inflammation', title: 'Можливі ознаки тиреоїдиту', n: inflammation, tip: 'При болю в шиї важливо оцінити аналізи та запалення. Не займайтесь самолікуванням.' }
    ].sort((a,b) => b.n - a.n);

    const top = buckets.filter(b => b.n > 0).slice(0, 2);

    const kpi = `
      <div class="kpi">
        <span>Гіпо: ${pct(hypo)}%</span>
        <span>Гіпер: ${pct(hyper)}%</span>
        <span>Вузол/зоб: ${pct(structural)}%</span>
        <span>Запалення: ${pct(inflammation)}%</span>
      </div>
    `;

    const nextSteps = `
      <ol>
        <li>Зробіть базові аналізи (TSH, вільний T4) та/або УЗД — залежно від скарг.</li>
        <li>Запишіться на консультацію, щоб оцінити причину і визначити план.</li>
        <li>Якщо є утруднення дихання/ковтання або швидко росте утворення на шиї — зверніться терміново.</li>
      </ol>
    `;

    const topsHtml = top.length
      ? top.map(t => `<div style="margin-top:10px"><strong>${t.title}</strong><div class="muted" style="margin-top:4px">${t.tip}</div></div>`).join('')
      : `<div><strong>Недостатньо даних</strong><div class="muted" style="margin-top:4px">Оберіть хоча б 2–3 симптоми, щоб отримати підказку.</div></div>`;

    return `
      <h4>Підказка за вибраними симптомами</h4>
      <div class="muted">Це не діагноз, а орієнтир: який напрям перевірити першочергово.</div>
      ${kpi}
      ${topsHtml}
      <hr style="border:0;border-top:1px solid var(--line); margin:14px 0" />
      <strong>Що робити далі</strong>
      ${nextSteps}
    `;
  };

  if (analyzeBtn && symptomForm && symptomResult) {
    analyzeBtn.addEventListener('click', () => {
      const selected = $$('input[type="checkbox"]:checked', symptomForm).map(i => i.value);

      const score = { hypo: 0, hyper: 0, structural: 0, inflammation: 0 };
      selected.forEach(v => {
        if (weights.hypo.has(v)) score.hypo += 1;
        if (weights.hyper.has(v)) score.hyper += 1;
        if (weights.structural.has(v)) score.structural += 1;
        if (weights.inflammation.has(v)) score.inflammation += 1;
      });

      symptomResult.innerHTML = buildResult({ ...score, selected });
    });

    symptomForm.addEventListener('reset', () => {
      // small delay so checkboxes reset first
      setTimeout(() => {
  // Mark JS enabled (for graceful reveal animations)
  document.documentElement.classList.add('js');

        symptomResult.innerHTML = '<div class="result-empty">Оберіть симптоми та натисніть «Показати підказку».</div>';
      }, 0);
    });
  }

  


  // ----------------------------
  // Glossary search (in modal)
  // ----------------------------
  const glossSearch = $('[data-glossary-search]');
  const glossItems = $$('.gloss-item');
  const glossEmpty = $('[data-glossary-empty]');
  const glossClear = $('[data-glossary-clear]');

  const applyGlossFilter = () => {
    if (!glossSearch) return;
    const q = (glossSearch.value || '').trim().toLowerCase();
    let shown = 0;
    glossItems.forEach((it) => {
      const hay = ((it.getAttribute('data-terms') || '') + ' ' + (it.textContent || '')).toLowerCase();
      const ok = !q || hay.includes(q);
      it.hidden = !ok;
      if (ok) shown += 1;
    });
    if (glossEmpty) glossEmpty.hidden = shown !== 0;
  };

  if (glossSearch) {
    glossSearch.addEventListener('input', applyGlossFilter);
  }
  if (glossClear && glossSearch) {
    glossClear.addEventListener('click', () => {
      glossSearch.value = '';
      applyGlossFilter();
      glossSearch.focus();
    });
  }
  // ----------------------------
  // Simple modals (Privacy policy)
  // ----------------------------
  const openers = $$('[data-modal-open]');
  let activeModal = null;
  let lastFocus = null;

  const openModal = (name, triggerEl) => {
    const modal = document.querySelector(`[data-modal="${name}"]`);
    if (!modal) return;
    lastFocus = triggerEl || document.activeElement;
    modal.hidden = false;
    activeModal = modal;
    document.body.style.overflow = 'hidden';

    // focus dialog
    const dialog = modal.querySelector('.modal-dialog') || modal;
    dialog.setAttribute('tabindex', '-1');
    dialog.focus({ preventScroll: true });

    // focus search input for glossary
    if (name === 'glossary') {
      const s = modal.querySelector('[data-glossary-search]');
      if (s) setTimeout(() => s.focus(), 0);
    }
  };

  const closeModal = () => {
    if (!activeModal) return;
    activeModal.hidden = true;
    document.body.style.overflow = '';
    const back = lastFocus;
    activeModal = null;
    if (back && typeof back.focus === 'function') {
      back.focus({ preventScroll: true });
    }
  };

  if (openers.length) {
    openers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = btn.getAttribute('data-modal-open');
        openModal(name, btn);
      });
    });
  }

  // close buttons / backdrop
  $$('.modal [data-modal-close]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

})();
