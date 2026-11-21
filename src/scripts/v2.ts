/**
 * v2 home page demos: the shared behavior. DOM only, no dependencies.
 *
 *   reveal        [data-reveal] gets .is-in once, when it scrolls into view
 *   header state  [data-v2-header] gets data-scrolled after 24px of scroll
 *   current link  [data-v2-nav] links get aria-current for the section on screen
 *   mobile menu   [data-v2-menu-button] opens [data-v2-menu], focus trapped
 *   open now      [data-v2-open] reads the hours JSON, answers in Eastern time
 *   today's row   [data-v2-hours] rows get data-today for the current day
 *   form guard    a placeholder Formspree endpoint never sends
 *
 * Each demo adds its own signature move in its own page script.
 */

export const reducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ reveal */
function reveal(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  els.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------ header state */
function headerState(): void {
  const header = document.querySelector<HTMLElement>('[data-v2-header]');
  if (!header) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    header.toggleAttribute('data-scrolled', window.scrollY > 24);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

/* --------------------------------------------------------- current section */
/** Marks the menu link for the section on screen with aria-current. */
function currentSection(): void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-v2-nav] a[href^="#"]'),
  );
  if (links.length === 0) return;
  const targets = links
    .map((a) => ({ a, el: document.getElementById(a.hash.slice(1)) }))
    .filter((t): t is { a: HTMLAnchorElement; el: HTMLElement } => !!t.el && t.el !== document.body);

  let ticking = false;
  const update = () => {
    ticking = false;
    // The section whose top most recently crossed the upper third of the screen.
    const line = window.innerHeight * 0.35;
    let active: HTMLAnchorElement | null = null;
    let best = -Infinity;
    for (const t of targets) {
      const top = t.el.getBoundingClientRect().top;
      if (top <= line && top > best) {
        best = top;
        active = t.a;
      }
    }
    for (const a of links) {
      const on = active ? a === active : a.hash === '#top';
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    }
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

/* ------------------------------------------------------------- mobile menu */
function mobileMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-v2-menu-button]');
  const panel = document.querySelector<HTMLElement>('[data-v2-menu]');
  if (!button || !panel) return;

  const focusables = () =>
    Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
      (el) => el.offsetParent !== null,
    );

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !panel.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  function open(): void {
    panel!.hidden = false;
    button!.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('v2-menu-open');
    document.addEventListener('keydown', onKey);
    focusables()[0]?.focus();
  }

  function close(returnFocus = true): void {
    if (panel!.hidden) return;
    panel!.hidden = true;
    button!.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('v2-menu-open');
    document.removeEventListener('keydown', onKey);
    if (returnFocus) button!.focus();
  }

  button.addEventListener('click', () => {
    if (button.getAttribute('aria-expanded') === 'true') close();
    else open();
  });
  panel.querySelectorAll('[data-v2-menu-close]').forEach((el) =>
    el.addEventListener('click', () => close()),
  );
  // Tapping a link closes the panel and lets the anchor jump happen.
  panel.querySelectorAll('a[href]').forEach((a) => a.addEventListener('click', () => close(false)));
  // A phone rotated to desktop width should not keep the panel open.
  window.matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
    if (e.matches) close(false);
  });
}

/* ---------------------------------------------------------------- open now */
export type V2Hour = { day: number; short: string; closed: boolean; open?: string; close?: string };

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** The shop's clock: ISO weekday (Monday = 1) and minutes past midnight, Eastern. */
export function shopClock(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: DAY_ORDER.indexOf(get('weekday')) + 1,
    minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')),
  };
}

const toMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

/** "19:00" to "7 PM", "11:30" to "11:30 AM". */
const clockLabel = (t: string): string => {
  const [h, m] = t.split(':').map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, '0')}` : ''} ${h >= 12 ? 'PM' : 'AM'}`;
};

export function openStatus(rows: V2Hour[], now: Date): { open: boolean; text: string } {
  const { day, minutes } = shopClock(now);
  const today = rows.find((r) => r.day === day);

  if (today && !today.closed && today.open && today.close) {
    if (minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
      return { open: true, text: `OPEN NOW · UNTIL ${clockLabel(today.close)}` };
    }
    if (minutes < toMinutes(today.open)) {
      return { open: false, text: `CLOSED · OPENS TODAY ${clockLabel(today.open)}` };
    }
  }
  // Closed for the rest of today: find the next day with hours.
  for (let i = 1; i <= 7; i++) {
    const next = rows.find((r) => r.day === ((day - 1 + i) % 7) + 1);
    if (next && !next.closed && next.open) {
      return { open: false, text: `CLOSED · OPENS ${next.short} ${clockLabel(next.open)}` };
    }
  }
  return { open: false, text: 'CLOSED' };
}

function openNow(): void {
  const now = new Date();
  for (const el of document.querySelectorAll<HTMLElement>('[data-v2-open]')) {
    let rows: V2Hour[] = [];
    try {
      rows = JSON.parse(el.dataset.hours ?? '[]');
    } catch {
      continue;
    }
    const text = el.querySelector<HTMLElement>('[data-v2-open-text]');
    if (!text || rows.length === 0) continue;
    const status = openStatus(rows, now);
    text.textContent = status.text;
    el.dataset.state = status.open ? 'open' : 'closed';
  }
  // Hours tables are built at build time. Mark the shop's real today.
  const { day } = shopClock(now);
  for (const row of document.querySelectorAll<HTMLElement>('[data-v2-hours] [data-day]')) {
    const isToday = Number(row.dataset.day) === day;
    row.toggleAttribute('data-today', isToday);
    const flag = row.querySelector<HTMLElement>('[data-today-flag]');
    if (flag) flag.hidden = !isToday;
  }
}

/* -------------------------------------------------------------- form guard */
function formGuard(): void {
  for (const form of document.querySelectorAll<HTMLFormElement>('[data-v2-form]')) {
    form.addEventListener('submit', (e) => {
      // A placeholder endpoint never sends. A real one posts normally.
      if (!form.action.includes('FORM_ID')) return;
      e.preventDefault();
      const note = form.querySelector<HTMLElement>('[data-v2-form-note]');
      if (note) {
        note.hidden = false;
        note.textContent = 'Demo form. Not connected yet.';
      }
    });
  }
}

reveal();
headerState();
currentSection();
mobileMenu();
openNow();
formGuard();
document.documentElement.setAttribute('data-v2-ready', '');
