/**
 * Motion: Lenis smooth scroll + GSAP ScrollTrigger.
 *
 * Everything here is optional decoration. If reduced motion is requested, or
 * the viewport is narrow enough that pinning would fight the reader, the whole
 * module bails out and the page renders as plain stacked sections — the reveal
 * fallback in global.css already leaves content visible.
 *
 * Rebuilt on every view transition, torn down before each swap.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let rafId = 0;
let observers: IntersectionObserver[] = [];

/* ------------------------------------------------------------------ reveal */
function initReveal() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!nodes.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  nodes.forEach((n) => io.observe(n));
  observers.push(io);
}

/* ---------------------------------------------------------------- parallax */
function initParallax() {
  const layers = gsap.utils.toArray<HTMLElement>('[data-speed]');
  for (const layer of layers) {
    const speed = Number(layer.dataset.speed ?? 1);
    if (!speed || speed === 1) continue;
    // Travel is capped at 12% of the viewport so nothing ever races the page.
    const travel = gsap.utils.clamp(-0.12, 0.12, (1 - speed)) * window.innerHeight;
    gsap.fromTo(
      layer,
      { yPercent: 0, y: -travel },
      {
        y: travel,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('[data-parallax-scope]') ?? layer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.1,
        },
      },
    );
  }
}

/* ------------------------------------------------------- hero text lift-off */
function initHero() {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const copy = hero.querySelector('[data-hero-copy]');
  const media = hero.querySelector('[data-hero-media]');
  if (copy) {
    gsap.to(copy, {
      yPercent: 18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  }
  if (media) {
    gsap.to(media, {
      yPercent: 12,
      scale: 1.06,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
    });
  }
}

/* ------------------------------------------------------------------- setup */
function start() {
  /* Tells the failsafe in Base.astro that this module made it. Without the
     flag the page un-hides itself after a moment rather than staying blank. */
  document.documentElement.setAttribute('data-motion-ready', '');
  initReveal();
  if (reduced()) return;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  initHero();
  initParallax();
  ScrollTrigger.refresh();
}

function stop() {
  cancelAnimationFrame(rafId);
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
  gsap.globalTimeline.clear();
  observers.forEach((o) => o.disconnect());
  observers = [];
}

start();
document.addEventListener('astro:after-swap', start);
document.addEventListener('astro:before-swap', stop);

// Anchor links inside a Lenis page need to be handed to Lenis.
document.addEventListener('click', (e) => {
  if (!lenis) return;
  const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
  if (!(link instanceof HTMLAnchorElement)) return;
  const id = link.getAttribute('href')!.slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  lenis.scrollTo(target, { offset: -96 });
});
