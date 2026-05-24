const THEMES = {
  plain:  { page: '#fafaf8', ink: '#1a1a1a', inkFaint: '#a0a0a0', inkGhost: '#d4d4d4', pageAlt: '#f0efe9' },
  autumn: { page: '#f5e6d3', ink: '#2d1b0e', inkFaint: '#8b6a50', inkGhost: '#c4a882', pageAlt: '#eddfc4' },
  rain:   { page: '#e8eff7', ink: '#1a2a3a', inkFaint: '#5a7a9a', inkGhost: '#a0b8cc', pageAlt: '#d8e5f0' },
  starry: { page: '#080c14', ink: '#e8e8f0', inkFaint: '#8888a0', inkGhost: '#444460', pageAlt: '#0e1420' },
};

export function applyTheme(mode) {
  const t = THEMES[mode] || THEMES.plain;
  const root = document.documentElement;
  root.style.setProperty('--page', t.page);
  root.style.setProperty('--ink', t.ink);
  root.style.setProperty('--ink-faint', t.inkFaint);
  root.style.setProperty('--ink-ghost', t.inkGhost);
  root.style.setProperty('--page-alt', t.pageAlt);
}

// Per-mode caps: skip the animation if too many letters already in flight
const inFlight = { autumn: 0, rain: 0, starry: 0 };
const MAX_FLIGHT = { autumn: 10, rain: 6, starry: 99 };

export function triggerAnimation(char, rect, mode, onLand) {
  if (inFlight[mode] >= MAX_FLIGHT[mode]) return false;
  if (mode === 'autumn') animateAutumn(char, rect, onLand);
  else if (mode === 'rain') animateRain(char, rect);
  else if (mode === 'starry') animateStarry(char, rect);
  return true;
}

// --- Shared ---

function makeLetterEl(char) {
  const el = document.createElement('span');
  el.textContent = char;
  el.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    pointer-events: none;
    z-index: 9999;
    font-family: inherit;
    font-size: var(--font-size, 19px);
    line-height: 1;
    color: var(--ink, #1a1a1a);
    user-select: none;
    will-change: transform;
  `;
  document.body.appendChild(el);
  return el;
}

function cubic(t, p0, p1, p2, p3) {
  const m = 1 - t;
  return m*m*m*p0 + 3*m*m*t*p1 + 3*m*t*t*p2 + t*t*t*p3;
}

function easeInOut(t) {
  return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
}

// --- Autumn: blow in from the left along a random bezier path ---

function animateAutumn(char, rect, onLand) {
  const el = makeLetterEl(char);
  inFlight.autumn++;

  const endX = rect.left;
  const endY = rect.top;
  const startX = -40;
  const startY = 80 + Math.random() * (window.innerHeight * 0.65);

  const cp1x = startX + (endX - startX) * (0.15 + Math.random() * 0.25);
  const cp1y = startY + (Math.random() - 0.5) * 300;
  const cp2x = endX - (endX - startX) * (0.05 + Math.random() * 0.2);
  const cp2y = endY + (Math.random() - 0.5) * 180;

  const startRot = (Math.random() - 0.5) * 80;
  // Leaves always drift slowly — 900ms to 1300ms regardless of typing speed
  const duration = 900 + Math.random() * 400;
  const t0 = performance.now();

  function frame(now) {
    const raw = Math.min((now - t0) / duration, 1);
    const e = easeInOut(raw);

    const x = cubic(e, startX, cp1x, cp2x, endX);
    const y = cubic(e, startY, cp1y, cp2y, endY);
    const rot = startRot * (1 - e) + Math.sin(raw * Math.PI * 2.5) * 18 * (1 - e);

    el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;

    if (raw < 1) {
      requestAnimationFrame(frame);
    } else {
      el.remove();
      inFlight.autumn = Math.max(0, inFlight.autumn - 1);
      onLand?.();
    }
  }

  requestAnimationFrame(frame);
}

// --- Rain: fall from above, splash on landing ---

function animateRain(char, rect) {
  const el = makeLetterEl(char);
  inFlight.rain++;

  const endX = rect.left;
  const endY = rect.top;
  const startX = endX + (Math.random() - 0.5) * 24;
  const startY = -24;

  // Rain falls at a natural speed — 350ms to 550ms
  const duration = 350 + Math.random() * 200;
  const t0 = performance.now();

  function frame(now) {
    const t = Math.min((now - t0) / duration, 1);
    const e = t * t; // ease-in for gravity

    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * e;

    el.style.transform = `translate(${x}px, ${y}px)`;

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      el.remove();
      inFlight.rain = Math.max(0, inFlight.rain - 1);
      splash(endX, endY);
    }
  }

  requestAnimationFrame(frame);
}

function splash(x, y) {
  const count = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist = 7 + Math.random() * 9;
    const size = 1.5 + Math.random();
    dot.style.cssText = `
      position: fixed;
      left: 0; top: 0;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: var(--ink-faint, #5a7a9a);
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(dot);
    dot.animate([
      { transform: `translate(${x}px, ${y}px)`, opacity: 0.5 },
      { transform: `translate(${x + Math.cos(angle) * dist}px, ${y + Math.sin(angle) * dist - 6}px)`, opacity: 0 },
    ], { duration: 260 + Math.random() * 80, easing: 'ease-out' })
      .onfinish = () => dot.remove();
  }
}

// --- Starry Night: bloom at cursor ---

function animateStarry(char, rect) {
  const el = makeLetterEl(char);
  const x = rect.left;
  const y = rect.top;

  el.style.transform = `translate(${x}px, ${y}px)`;

  el.animate([
    { transform: `translate(${x}px, ${y}px) scale(0.15)`, filter: 'blur(4px) brightness(5)', opacity: 1 },
    { transform: `translate(${x}px, ${y}px) scale(1.12)`, filter: 'blur(1px) brightness(2)', opacity: 1 },
    { transform: `translate(${x}px, ${y}px) scale(1)`,    filter: 'blur(0) brightness(1)',   opacity: 1 },
  ], { duration: 380, easing: 'ease-out' })
    .onfinish = () => el.remove();

  starBurst(x, y);
}

function starBurst(x, y) {
  const count = 7;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const angle = (i / count) * Math.PI * 2;
    const dist = 14 + Math.random() * 10;
    const size = 1 + Math.random() * 1.2;
    p.style.cssText = `
      position: fixed;
      left: 0; top: 0;
      width: ${size}px; height: ${size}px;
      border-radius: 50%;
      background: var(--ink, #e8e8f0);
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(p);
    p.animate([
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 0.85 },
      { transform: `translate(${x + Math.cos(angle)*dist}px, ${y + Math.sin(angle)*dist}px) scale(0)`, opacity: 0 },
    ], { duration: 380, easing: 'ease-out' })
      .onfinish = () => p.remove();
  }
}
