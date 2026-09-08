// Animaciones de El Perro Verde.
// GSAP + ScrollTrigger para los reveals; contadores con fallback puro.
// Regla de oro: si algo falla, el contenido SIEMPRE queda visible.

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ---- Huellas del fondo ----
// Cada cierto tiempo (aleatorio) sale un "paseo": un caminante invisible cruza
// la pantalla dejando pisadas (alternando pata izq/der), a veces recto y a
// veces serpenteando. Las pisadas aparecen, aguantan un poco y se desvanecen.
// Entre paseo y paseo no pasa nada. El bucle rAF solo corre mientras hay algo
// en pantalla. Se desactiva con prefers-reduced-motion. Si el ratón pasa cerca
// (solo en dispositivos con puntero fino), las pisadas se apartan.
function patasAndando() {
  const cont = document.querySelector('[data-patas]');
  if (!cont) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const finoConHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const HALF_PI = Math.PI / 2;

  const SVG_HUELLA =
    '<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">' +
    '<ellipse cx="32" cy="43" rx="15" ry="13"/>' +
    '<ellipse cx="13" cy="25" rx="6.4" ry="9" transform="rotate(-20 13 25)"/>' +
    '<ellipse cx="25" cy="14" rx="6.4" ry="9.6"/>' +
    '<ellipse cx="39" cy="14" rx="6.4" ry="9.6"/>' +
    '<ellipse cx="51" cy="25" rx="6.4" ry="9" transform="rotate(20 51 25)"/></svg>';

  /** @type {Array<Object>} pisadas vivas en pantalla */
  const huellas = [];
  /** @type {Array<Object>} paseos en curso (1-2 a la vez) */
  const paseos = [];
  let mx = -9999;
  let my = -9999;
  let raf = 0;
  let temporizador = 0;
  let anterior = 0;

  function nuevoPaseo() {
    if (paseos.length >= 2) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    const m = 90;
    const borde = Math.floor(rnd(0, 4));
    let x;
    let y;
    let rumbo;
    if (borde === 0) {
      x = -m;
      y = rnd(H * 0.08, H * 0.92);
      rumbo = rnd(-0.5, 0.5); // izq -> der
    } else if (borde === 1) {
      x = W + m;
      y = rnd(H * 0.08, H * 0.92);
      rumbo = Math.PI + rnd(-0.5, 0.5); // der -> izq
    } else if (borde === 2) {
      x = rnd(W * 0.08, W * 0.92);
      y = -m;
      rumbo = HALF_PI + rnd(-0.5, 0.5); // arriba -> abajo
    } else {
      x = rnd(W * 0.08, W * 0.92);
      y = H + m;
      rumbo = -HALF_PI + rnd(-0.5, 0.5); // abajo -> arriba
    }

    paseos.push({
      x,
      y,
      rumbo,
      rumboBase: rumbo,
      vel: rnd(130, 215), // px/s
      culebra: Math.random() < 0.55 ? rnd(0.06, 0.5) : 0, // 0 = recto
      paso: rnd(52, 68),
      sep: rnd(11, 18),
      opMax: rnd(0.12, 0.22),
      escala: rnd(0.68, 1.05),
      recorrido: 0,
      desdeUltima: 0,
      pisada: 0,
      maxDist: Math.hypot(W, H) + m * 3,
    });
  }

  function colocarHuella(x, y, rot, sc, opMax) {
    const el = document.createElement('span');
    el.className = 'pata';
    el.innerHTML = SVG_HUELLA;
    cont.appendChild(el);
    huellas.push({
      el,
      x,
      y,
      rot,
      sc,
      opMax,
      nacido: performance.now(),
      vida: rnd(1600, 3200), // ms quieta antes de desvanecer
      fundido: rnd(900, 1600), // ms de desvanecido
      ex: 0,
      ey: 0,
    });
    // Salvaguarda por si algo se desmadra
    if (huellas.length > 90) huellas.shift().el.remove();
  }

  function frame(now) {
    const dt = Math.min((now - anterior) / 1000, 0.05);
    anterior = now;

    for (let i = paseos.length - 1; i >= 0; i--) {
      const p = paseos[i];
      p.recorrido += p.vel * dt;
      p.rumbo =
        p.rumboBase +
        Math.sin(p.recorrido * 0.004) * p.culebra +
        Math.sin(p.recorrido * 0.013 + 1.3) * p.culebra * 0.4;
      p.x += Math.cos(p.rumbo) * p.vel * dt;
      p.y += Math.sin(p.rumbo) * p.vel * dt;
      p.desdeUltima += p.vel * dt;

      while (p.desdeUltima >= p.paso) {
        p.desdeUltima -= p.paso;
        const lado = p.pisada++ % 2 ? 1 : -1;
        const ang = p.rumbo + HALF_PI;
        colocarHuella(
          p.x + Math.cos(ang) * p.sep * lado,
          p.y + Math.sin(ang) * p.sep * lado,
          ang + lado * 0.1,
          p.escala,
          p.opMax
        );
      }

      if (p.recorrido > p.maxDist) paseos.splice(i, 1);
    }

    for (let i = huellas.length - 1; i >= 0; i--) {
      const h = huellas[i];
      const edad = now - h.nacido;
      let op;
      if (edad < 240) op = (edad / 240) * h.opMax;
      else if (edad < 240 + h.vida) op = h.opMax;
      else if (edad < 240 + h.vida + h.fundido)
        op = h.opMax * (1 - (edad - 240 - h.vida) / h.fundido);
      else {
        h.el.remove();
        huellas.splice(i, 1);
        continue;
      }

      let objx = 0;
      let objy = 0;
      if (finoConHover) {
        const dx = h.x - mx;
        const dy = h.y - my;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < 150) {
          const f = (1 - d / 150) ** 2 * 46;
          objx = (dx / d) * f;
          objy = (dy / d) * f;
        }
      }
      h.ex += (objx - h.ex) * 0.2;
      h.ey += (objy - h.ey) * 0.2;

      h.el.style.opacity = op.toFixed(3);
      h.el.style.transform =
        'translate(' +
        (h.x + h.ex).toFixed(1) +
        'px,' +
        (h.y + h.ey).toFixed(1) +
        'px) rotate(' +
        h.rot.toFixed(3) +
        'rad) scale(' +
        h.sc.toFixed(3) +
        ')';
    }

    raf = paseos.length || huellas.length ? requestAnimationFrame(frame) : 0;
  }

  function arrancar() {
    if (!raf) {
      anterior = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function programar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(
      () => {
        if (paseos.length === 0 || Math.random() < 0.4) {
          nuevoPaseo();
          arrancar();
        }
        programar();
      },
      rnd(4000, 12000)
    );
  }

  if (finoConHover) {
    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true }
    );
    document.addEventListener('pointerleave', () => {
      mx = -9999;
      my = -9999;
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearTimeout(temporizador);
    } else {
      paseos.length = 0; // descarta paseos que quedaron en cola mientras oculto
      anterior = performance.now();
      arrancar(); // limpia huellas rezagadas y reprograma
      programar();
    }
  });

  // Primer paseo poco después de cargar; luego, a intervalos aleatorios.
  temporizador = setTimeout(() => {
    nuevoPaseo();
    arrancar();
    programar();
  }, rnd(1500, 3500));
}

// ---- Botón flotante de WhatsApp ----
// Se oculta cuando cualquier CTA de WhatsApp de la página (.wa-cta) está en
// pantalla y reaparece al salir. Sin JS el botón queda visible siempre.
function botonFlotante() {
  const fab = document.getElementById('wa-fab');
  if (!fab) return;
  const dianas = [...document.querySelectorAll('.wa-cta')];
  if (!dianas.length) return;

  const aplicar = (ocultar) => {
    fab.classList.toggle('oculto', ocultar);
    fab.setAttribute('aria-hidden', ocultar ? 'true' : 'false');
    if (ocultar) fab.setAttribute('tabindex', '-1');
    else fab.removeAttribute('tabindex');
  };

  // Estado inicial inmediato (sin esperar al observer -> sin parpadeo al cargar)
  const enPantalla = (el) => {
    const r = el.getBoundingClientRect();
    return (
      r.bottom > 0 &&
      r.top < window.innerHeight &&
      r.right > 0 &&
      r.left < window.innerWidth
    );
  };
  aplicar(dianas.some(enPantalla));

  if (!('IntersectionObserver' in window)) return;
  const visibles = new Set();
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (e.isIntersecting) visibles.add(e.target);
        else visibles.delete(e.target);
      }
      aplicar(visibles.size > 0);
    },
    { threshold: 0 }
  );
  dianas.forEach((d) => io.observe(d));
}

function init() {
  patasAndando();
  botonFlotante();

  // Año en el footer
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Header: fondo translúcido al bajar
  const header = document.querySelector('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menú hamburguesa móvil
  const hamb = document.getElementById('hamb');
  const menu = document.getElementById('menu');
  if (hamb && menu) {
    const cerrar = () => {
      hamb.classList.remove('active');
      menu.classList.remove('open');
      hamb.setAttribute('aria-expanded', 'false');
    };
    hamb.addEventListener('click', () => {
      const abierto = menu.classList.toggle('open');
      hamb.classList.toggle('active', abierto);
      hamb.setAttribute('aria-expanded', String(abierto));
    });
    menu.addEventListener('click', (e) => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'A') cerrar();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrar();
    });
  }

  // ---- Contadores ----
  const counters = document.querySelectorAll('[data-count]');
  let nf;
  try {
    nf = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });
  } catch {
    nf = new Intl.NumberFormat('es-ES');
  }
  const fmt = (n) => (n >= 1000 ? nf.format(n) : String(n));

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = Number(el.dataset.count);
    const dur = 1400;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    })(t0);
  }

  // ---- Reveals ----
  const reveals = document.querySelectorAll('.reveal');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showAll = () => {
    reveals.forEach((r) => r.classList.add('revealed'));
    counters.forEach((c) => runCounter(c));
  };

  if (reduce) {
    showAll();
    return;
  }

  const heroReveals = [...document.querySelectorAll('.hero .reveal')];
  // Deja el hero visible sí o sí (por si rAF se congela con la pestaña oculta).
  const asegurarHero = () => {
    heroReveals.forEach((el) => {
      el.classList.add('revealed');
      el.style.opacity = '';
      el.style.transform = '';
      el.style.translate = '';
    });
  };

  try {
    gsap.registerPlugin(ScrollTrigger);

    // Secuencia del hero al cargar
    gsap
      .timeline({ delay: 0.15, onComplete: asegurarHero })
      .fromTo(
        '.hero-text .reveal',
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          clearProps: 'opacity,transform,translate',
          onStart() {
            document
              .querySelectorAll('.hero-text .reveal')
              .forEach((r) => r.classList.add('revealed'));
          },
        }
      )
      .fromTo(
        '.hero-panel',
        { y: 36, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'opacity,transform,translate',
          onStart() {
            document.querySelector('.hero-panel')?.classList.add('revealed');
          },
        },
        '-=.5'
      );

    // El hero debe estar visible pronto pase lo que pase
    setTimeout(asegurarHero, 1800);

    // Aparición escalonada del resto de secciones
    document.querySelectorAll('section:not(.hero) .reveal').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('revealed'),
      });
    });

    // Contadores al entrar en pantalla
    counters.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: () => runCounter(el),
      });
    });

    // Red de seguridad: si tras 3s nada se ha revelado, mostramos todo
    setTimeout(() => {
      if (![...reveals].some((r) => r.classList.contains('revealed'))) showAll();
    }, 3000);
  } catch (err) {
    // GSAP no cargó: IntersectionObserver
    console.warn('GSAP no disponible, usando fallback', err);
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add('revealed');
          if (en.target instanceof HTMLElement && en.target.dataset.count) {
            runCounter(en.target);
          }
          obs.unobserve(en.target);
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((r) => io.observe(r));
    counters.forEach((c) => io.observe(c));
    setTimeout(() => {
      if (![...reveals].some((r) => r.classList.contains('revealed'))) showAll();
    }, 2500);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
