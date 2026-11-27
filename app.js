/* Zwave Studio — iPhone wallpaper & widget maker. No build step, no dependencies. */
(() => {
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ------------------------------------------------------------------ *
 * Constants
 * ------------------------------------------------------------------ */

const DEVICES = [
  { id: 'auto', name: 'This device' },
  { id: 'pro-max', name: 'iPhone 17 / 16 Pro Max', w: 1320, h: 2868 },
  { id: 'air', name: 'iPhone Air', w: 1260, h: 2736 },
  { id: 'pro', name: 'iPhone 17, 17 Pro, 16 Pro', w: 1206, h: 2622 },
  { id: 'plus', name: 'iPhone 16 Plus, 15 Plus / Pro Max, 14 Pro Max', w: 1290, h: 2796 },
  { id: 'base', name: 'iPhone 16, 16e, 15, 15 Pro, 14 Pro', w: 1179, h: 2556 },
  { id: 'old', name: 'iPhone 14, 13, 12 (and Pro)', w: 1170, h: 2532 },
  { id: 'old-max', name: 'iPhone 14 Plus, 13 / 12 Pro Max', w: 1284, h: 2778 },
  { id: 'mini', name: 'iPhone 13 mini, 12 mini', w: 1080, h: 2340 },
  { id: 'x', name: 'iPhone 11 Pro, XS, X', w: 1125, h: 2436 },
  { id: 'xr', name: 'iPhone 11, XR', w: 828, h: 1792 },
  { id: 'se', name: 'iPhone SE, 8', w: 750, h: 1334 },
];

// Widget sizes in points (6.1" class iPhone) and the export scale.
const WIDGET_PT = { small: [170, 170], medium: [364, 170], large: [364, 382] };
const WIDGET_SCALE = 3;
// Logical phone used for mock-ups and wallpaper-matching widget slices.
const PHONE_PT = [393, 852];
const SLOT = { x: 14.5, y: 64 };

const FONTS = {
  system: '-apple-system, "SF Pro Display", system-ui, "Helvetica Neue", Arial, sans-serif',
  rounded: 'ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif',
  serif: 'ui-serif, "New York", Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

const PALETTES = [
  ['#ff7e5f', '#feb47b', '#ff5e62', '#6a3093'],
  ['#0f2027', '#2c5364', '#00b4db', '#a8edea'],
  ['#0b132b', '#1c7c54', '#73e2a7', '#7b2cbf'],
  ['#ffecd2', '#fcb69f', '#ff9a9e', '#a18cd1'],
  ['#0f0c29', '#302b63', '#8e2de2', '#ff6ec7'],
  ['#134e5e', '#71b280', '#2f5d50', '#e8f5c8'],
  ['#3a0ca3', '#f72585', '#7209b7', '#4cc9f0'],
  ['#f4ede1', '#e6d5b8', '#c9a66b', '#8c6a43'],
  ['#0d0d0d', '#2e2e2e', '#8a8a8a', '#e8e8e8'],
  ['#ff4e50', '#fc913a', '#f9d423', '#ede574'],
  ['#e0c3fc', '#8ec5fc', '#b39ddb', '#fdfbff'],
  ['#200122', '#6f0000', '#ff4b1f', '#ff9068'],
  ['#1d2b64', '#f8cdda', '#6d83f2', '#ffe5ec'],
  ['#264653', '#2a9d8f', '#e9c46a', '#e76f51'],
  ['#0a0f0d', '#1b4332', '#52b788', '#d8f3dc'],
  ['#2b1055', '#7597de', '#d53369', '#daae51'],
];

const BG_STYLES = ['mesh', 'gradient', 'waves', 'bokeh', 'bauhaus', 'rings', 'dunes'];

const QUOTES = [
  ['Make it simple, but significant.', 'Don Draper'],
  ['Stay close to anything that makes you glad you are alive.', 'Hafiz'],
  ['Well done is better than well said.', 'Benjamin Franklin'],
  ['The best way out is always through.', 'Robert Frost'],
  ['Act as if what you do makes a difference. It does.', 'William James'],
  ['Little by little, one travels far.', 'J.R.R. Tolkien'],
];

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const DEFAULT_BG = {
  style: 'mesh', c0: '#0f0c29', c1: '#302b63', c2: '#8e2de2', c3: '#ff6ec7',
  angle: 160, detail: 5, soft: 60, seed: 7,
  grain: 18, dim: 0, vignette: 25,
  photo: null, photoBlur: 0, tint: 0,
  text: '', textPos: 'bottom', font: 'serif', textSize: 50, textColor: '#ffffff',
  device: 'auto',
};

const inAMonth = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const DEFAULT_W = {
  type: 'quote', size: 'small', bgMode: 'gradient',
  c0: '#302b63', c1: '#8e2de2', fg: '#ffffff', accent: '#ff6ec7',
  font: 'serif', align: 'left',
  quote: QUOTES[0][0], author: QUOTES[0][1],
  event: 'Vacation', eventDate: inAMonth,
  big: '✦', sub: 'Focus',
  note: '', monday: false,
  photo: null, caption: '',
};

const state = {
  bg: { ...DEFAULT_BG },
  w: { ...DEFAULT_W },
  ui: { tab: 'bg', screen: 'home' },
};
let bgVersion = 0;

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem('zw-state') || 'null');
    if (s?.bg) Object.assign(state.bg, s.bg);
    if (s?.w) Object.assign(state.w, s.w);
    if (s?.ui) Object.assign(state.ui, s.ui);
  } catch { /* first run or storage unavailable */ }
}
let saveTimer;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data = { bg: state.bg, w: state.w, ui: state.ui };
    try { localStorage.setItem('zw-state', JSON.stringify(data)); }
    catch {
      // Photos can exceed the quota: keep everything else.
      try {
        localStorage.setItem('zw-state', JSON.stringify({
          bg: { ...state.bg, photo: null }, w: { ...state.w, photo: null }, ui: state.ui,
        }));
      } catch { /* storage unavailable */ }
    }
  }, 300);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hexRgb(h) {
  h = String(h || '#000').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = (h, a) => { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; };
function mix(a, b, t) {
  const A = hexRgb(a), B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
function lum(h) { const [r, g, b] = hexRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
const contrastText = bg => (lum(bg) > 0.62 ? '#111111' : '#ffffff');

function mkCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}
function ctx2d(c) {
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = true;
  x.imageSmoothingQuality = 'high';
  return x;
}

/** Blur by down- then up-sampling. Works everywhere (Safari's ctx.filter is unreliable). */
function softBlur(src, radius) {
  if (radius < 1) return src;
  let cur = src, w = src.width, h = src.height;
  const target = Math.max(1, radius / 1.5);
  const chain = [];
  let f = 1;
  while (f * 2 <= target) {
    f *= 2;
    const c = mkCanvas(w / f, h / f);
    ctx2d(c).drawImage(cur, 0, 0, c.width, c.height);
    chain.push(c); cur = c;
  }
  // Upsample back through the chain for a smooth result.
  for (let i = chain.length - 2; i >= 0; i--) {
    const c = mkCanvas(chain[i].width, chain[i].height);
    ctx2d(c).drawImage(cur, 0, 0, c.width, c.height);
    cur = c;
  }
  const out = mkCanvas(w, h);
  ctx2d(out).drawImage(cur, 0, 0, w, h);
  return out;
}

function drawCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) { out.push(line); line = word; }
      else line = test;
    }
    out.push(line);
  }
  return out;
}

/** Find the largest font size where text wraps within the box. */
function fitText(ctx, text, maxW, maxH, maxSize, minSize, weight, family, lh = 1.2) {
  let size = maxSize, lines;
  for (; size >= minSize; size -= Math.max(1, size * 0.06)) {
    ctx.font = `${weight} ${size}px ${family}`;
    lines = wrapLines(ctx, text, maxW);
    const widest = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (lines.length * size * lh <= maxH && widest <= maxW) return { size, lines };
  }
  ctx.font = `${weight} ${minSize}px ${family}`;
  lines = wrapLines(ctx, text, maxW);
  const maxLines = Math.max(1, Math.floor(maxH / (minSize * lh)));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…';
  }
  return { size: minSize, lines };
}

const imgCache = new Map();
function getImg(src) {
  if (!src) return null;
  let img = imgCache.get(src);
  if (!img) {
    img = new Image();
    img.onload = () => { bgVersion++; scheduleRender(); };
    img.src = src;
    imgCache.set(src, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

let noiseTile;
function getNoise() {
  if (noiseTile) return noiseTile;
  noiseTile = mkCanvas(160, 160);
  const x = noiseTile.getContext('2d');
  const d = x.createImageData(160, 160);
  const r = rng(42);
  for (let i = 0; i < d.data.length; i += 4) {
    const v = Math.floor(r() * 255);
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  x.putImageData(d, 0, 0);
  return noiseTile;
}

function deviceSize(id) {
  if (id && id !== 'auto') {
    const d = DEVICES.find(x => x.id === id);
    if (d?.w) return d;
  }
  const dpr = window.devicePixelRatio || 1;
  const sw = Math.round(Math.min(screen.width, screen.height) * dpr);
  const sh = Math.round(Math.max(screen.width, screen.height) * dpr);
  const match = DEVICES.find(d => d.w && Math.abs(d.w - sw) <= 3 && Math.abs(d.h - sh) <= 3);
  if (match) return match;
  const isPhone = /iPhone|iPod/.test(navigator.userAgent) || (sw < 1400 && sh / sw > 1.9);
  if (isPhone && sw >= 640) return { name: 'This device', w: sw, h: sh };
  return DEVICES.find(d => d.id === 'base');
}

/* ------------------------------------------------------------------ *
 * Background renderer
 * ------------------------------------------------------------------ */

function renderBackground(ctx, W, H, b, opts = {}) {
  const r = rng(b.seed);
  const C = [b.c0, b.c1, b.c2, b.c3];
  const pick = () => C[Math.floor(r() * 4)];
  const detail = Number(b.detail) || 5;
  const soft = (Number(b.soft) || 0) / 100;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';

  const vGrad = (a, z) => {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, a); g.addColorStop(1, z);
    return g;
  };

  switch (b.style) {
    case 'gradient': {
      const ang = ((Number(b.angle) || 0) - 90) * Math.PI / 180;
      const len = Math.abs(W * Math.cos(ang)) + Math.abs(H * Math.sin(ang));
      const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
      const g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
      C.forEach((c, i) => g.addColorStop(i / 3, c));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      break;
    }

    case 'mesh': {
      const sw = 90, sh = Math.round(90 * H / W);
      const s = mkCanvas(sw, sh), x = ctx2d(s);
      x.fillStyle = C[0]; x.fillRect(0, 0, sw, sh);
      const n = 3 + detail;
      for (let i = 0; i < n; i++) {
        const cx = r() * sw, cy = r() * sh;
        const rad = sw * (0.35 + r() * 0.55) * (0.7 + soft * 0.8);
        const col = C[1 + (i % 3)];
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, rgba(col, 0.95));
        g.addColorStop(0.5 - soft * 0.2, rgba(col, 0.55));
        g.addColorStop(1, rgba(col, 0));
        x.fillStyle = g; x.fillRect(0, 0, sw, sh);
      }
      const up = mkCanvas(sw * 4, sh * 4);
      ctx2d(up).drawImage(softBlur(s, 2 + soft * 6), 0, 0, up.width, up.height);
      ctx.drawImage(up, 0, 0, W, H);
      break;
    }

    case 'waves': {
      ctx.fillStyle = vGrad(C[0], C[1]); ctx.fillRect(0, 0, W, H);
      const n = 2 + detail;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 1 : i / (n - 1);
        const y0 = H * (0.3 + t * 0.62);
        const amp = H * (0.015 + r() * 0.035);
        const f1 = (0.6 + r() * 1.6) * Math.PI * 2 / W, f2 = f1 * (1.8 + r());
        const p1 = r() * 6.28, p2 = r() * 6.28;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let xx = 0; xx <= W + 4; xx += W / 80) {
          ctx.lineTo(xx, y0 + amp * Math.sin(f1 * xx + p1) + amp * 0.45 * Math.sin(f2 * xx + p2));
        }
        ctx.lineTo(W, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, y0 - amp, 0, H);
        const col = mix(C[2], C[3], t);
        g.addColorStop(0, rgba(col, 0.92));
        g.addColorStop(1, rgba(mix(col, C[0], 0.5), 0.95));
        ctx.fillStyle = g;
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = W * 0.03; ctx.shadowOffsetY = -W * 0.005;
        ctx.fill();
      }
      ctx.shadowColor = 'transparent';
      break;
    }

    case 'bokeh': {
      ctx.fillStyle = vGrad(C[0], C[1]); ctx.fillRect(0, 0, W, H);
      // Far, very soft layer.
      const far = mkCanvas(W / 8, H / 8), fx = ctx2d(far);
      const n = 8 + detail * 4;
      for (let i = 0; i < n; i++) {
        const rad = far.width * (0.05 + r() * 0.18);
        fx.fillStyle = rgba(i % 2 ? C[2] : C[3], 0.15 + r() * 0.35);
        fx.beginPath(); fx.arc(r() * far.width, r() * far.height, rad, 0, 7); fx.fill();
      }
      ctx.drawImage(softBlur(far, 3 + soft * 8), 0, 0, W, H);
      // Near, crisper discs.
      for (let i = 0; i < n * 0.7; i++) {
        const cx = r() * W, cy = r() * H, rad = W * (0.015 + r() * 0.07);
        const col = r() > 0.5 ? C[2] : C[3];
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const a = 0.18 + r() * 0.4;
        g.addColorStop(0, rgba(col, a * 0.7));
        g.addColorStop(0.85 - soft * 0.4, rgba(col, a));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 7); ctx.fill();
      }
      break;
    }

    case 'bauhaus': {
      const cols = Math.max(2, Math.round(1 + detail * 0.7));
      const cell = W / cols, rows = Math.ceil(H / cell);
      const oy = (H - rows * cell) / 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cell, y = oy + row * cell;
          const bgc = pick(); let fg = pick();
          if (fg === bgc) fg = C[(C.indexOf(bgc) + 2) % 4];
          ctx.fillStyle = bgc; ctx.fillRect(x - 0.5, y - 0.5, cell + 1, cell + 1);
          ctx.fillStyle = fg;
          const k = Math.floor(r() * 6), rot = Math.floor(r() * 4) * Math.PI / 2;
          ctx.save();
          ctx.translate(x + cell / 2, y + cell / 2); ctx.rotate(rot); ctx.translate(-cell / 2, -cell / 2);
          ctx.beginPath();
          if (k === 0) { ctx.moveTo(0, 0); ctx.arc(0, 0, cell, 0, Math.PI / 2); }
          else if (k === 1) { ctx.arc(cell / 2, cell, cell / 2, Math.PI, 0); }
          else if (k === 2) { ctx.arc(cell / 2, cell / 2, cell * 0.34, 0, 7); }
          else if (k === 3) { ctx.moveTo(0, 0); ctx.lineTo(cell, 0); ctx.lineTo(0, cell); }
          else if (k === 4) { ctx.rect(0, 0, cell / 2, cell); }
          else { ctx.arc(cell / 2, cell / 2, cell * 0.42, 0, Math.PI * 2); ctx.moveTo(cell / 2 + cell * 0.2, cell / 2); ctx.arc(cell / 2, cell / 2, cell * 0.2, 0, Math.PI * 2, true); }
          ctx.fill('evenodd');
          ctx.restore();
        }
      }
      break;
    }

    case 'rings': {
      const cx = W * (0.15 + r() * 0.7), cy = H * (0.2 + r() * 0.6);
      const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      const step = W * (0.18 - detail * 0.013);
      let i = Math.ceil(maxR / step);
      for (; i > 0; i--) {
        const t = i / Math.ceil(maxR / step);
        ctx.fillStyle = i % 2 ? mix(C[0], C[1], t) : mix(C[3], C[2], t);
        ctx.beginPath(); ctx.arc(cx, cy, i * step, 0, 7); ctx.fill();
      }
      break;
    }

    case 'dunes': {
      ctx.fillStyle = vGrad(C[3], C[2]); ctx.fillRect(0, 0, W, H);
      // Sun
      const sx = W * (0.25 + r() * 0.5), sy = H * (0.22 + r() * 0.12), sr = W * 0.16;
      const sg = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * (1.6 + soft * 2));
      sg.addColorStop(0, rgba('#ffffff', 0.85)); sg.addColorStop(0.35, rgba(C[3], 0.35)); sg.addColorStop(1, rgba(C[3], 0));
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = rgba('#ffffff', 0.9);
      ctx.beginPath(); ctx.arc(sx, sy, sr * 0.55, 0, 7); ctx.fill();
      const n = 2 + Math.round(detail * 0.6);
      for (let i = 0; i < n; i++) {
        const t = (i + 1) / n;
        const base = H * (0.45 + t * 0.45);
        const pk = W * (r() * 1.0 - 0.1), amp = H * (0.06 + r() * 0.08);
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let xx = 0; xx <= W + 4; xx += W / 60) {
          const d = (xx - pk) / W;
          ctx.lineTo(xx, base - amp * Math.exp(-d * d * 3) - amp * 0.25 * Math.sin(xx / W * 5 + i));
        }
        ctx.lineTo(W, H); ctx.closePath();
        const g = ctx.createLinearGradient(0, base - amp, 0, H);
        const col = mix(C[1], C[0], t);
        g.addColorStop(0, col); g.addColorStop(1, mix(col, '#000000', 0.25));
        ctx.fillStyle = g; ctx.fill();
      }
      break;
    }

    case 'photo': {
      ctx.fillStyle = vGrad(C[0], C[1]); ctx.fillRect(0, 0, W, H);
      const img = getImg(b.photo);
      if (img) {
        const blur = (Number(b.photoBlur) || 0) / 100 * W * 0.06;
        if (blur >= 1) {
          const tmp = mkCanvas(W, H);
          drawCover(ctx2d(tmp), img, 0, 0, W, H);
          ctx.drawImage(softBlur(tmp, blur), 0, 0);
        } else {
          drawCover(ctx, img, 0, 0, W, H);
        }
        const tint = (Number(b.tint) || 0) / 100;
        if (tint > 0) {
          ctx.globalCompositeOperation = 'soft-light';
          ctx.globalAlpha = tint;
          ctx.fillStyle = vGrad(C[2], C[3]); ctx.fillRect(0, 0, W, H);
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = tint * 0.35;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;
        }
      } else if (!opts.quiet) {
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.font = `600 ${W * 0.045}px ${FONTS.system}`;
        ctx.textAlign = 'center';
        ctx.fillText('Choose a photo below', W / 2, H / 2);
      }
      break;
    }
  }

  // Finishing
  const dim = (Number(b.dim) || 0) / 100;
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, 0, W, H); }

  const vig = (Number(b.vignette) || 0) / 100;
  if (vig > 0) {
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.hypot(W, H) / 2);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${vig * 0.75})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  const grain = (Number(b.grain) || 0) / 100;
  if (grain > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = grain * 0.55;
    const pat = ctx.createPattern(getNoise(), 'repeat');
    const k = Math.max(1, W / 1179 * 1.4);
    ctx.scale(k, k);
    ctx.fillStyle = pat; ctx.fillRect(0, 0, W / k, H / k);
    ctx.restore();
  }

  if (b.text && !opts.noText) {
    const fam = FONTS[b.font] || FONTS.system;
    const maxSize = W * (0.03 + (Number(b.textSize) || 50) / 100 * 0.16);
    const weight = b.font === 'serif' ? 500 : 700;
    const { size, lines } = fitText(ctx, b.text, W * 0.82, H * 0.2, maxSize, W * 0.025, weight, fam, 1.15);
    ctx.font = `${weight} ${size}px ${fam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = b.textColor;
    ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = size * 0.3;
    const cy = b.textPos === 'top' ? H * 0.4 : b.textPos === 'center' ? H * 0.5 : H * 0.76;
    const lh = size * 1.15;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, cy + (i - (lines.length - 1) / 2) * lh));
    ctx.shadowColor = 'transparent';
  }
  ctx.restore();
}

/* Cached full-phone wallpaper at a given width, used for widget slices and the mock-up. */
const wallCache = new Map();
function wallpaperAt(width, opts = {}) {
  const key = `${bgVersion}|${Math.round(width)}|${opts.noText ? 1 : 0}|${opts.blur || 0}`;
  if (wallCache.has(key)) return wallCache.get(key);
  if (wallCache.size > 8) wallCache.clear();
  const dev = deviceSize(state.bg.device);
  const h = width * dev.h / dev.w;
  let c = mkCanvas(width, h);
  renderBackground(ctx2d(c), c.width, c.height, state.bg, { noText: opts.noText, quiet: true });
  if (opts.blur) c = softBlur(c, opts.blur);
  wallCache.set(key, c);
  return c;
}

/* ------------------------------------------------------------------ *
 * Widget renderer
 * ------------------------------------------------------------------ */

function renderWidget(ctx, W, H, w) {
  const u = W / WIDGET_PT[w.size][0]; // pixels per point
  const fam = FONTS[w.font] || FONTS.system;
  const pad = 16 * u;
  const isSmall = w.size === 'small';
  const ts = w.size === 'large' ? 1.45 : 1; // secondary text scale
  ctx.save();
  ctx.textBaseline = 'alphabetic';

  // ---- Background
  const mode = w.type === 'photo' ? 'photo' : w.bgMode;
  if (mode === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, w.c0); g.addColorStop(1, w.c1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  } else if (mode === 'solid') {
    ctx.fillStyle = w.c0; ctx.fillRect(0, 0, W, H);
  } else if (mode === 'wallpaper' || mode === 'glass' || mode === 'smoke') {
    const phoneW = PHONE_PT[0] * u;
    const blur = mode === 'wallpaper' ? 0 : 18 * u;
    const wall = wallpaperAt(phoneW, { noText: true, blur });
    ctx.drawImage(wall, SLOT.x * u, SLOT.y * u, W, H, 0, 0, W, H);
    if (mode === 'glass') { ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(0, 0, W, H); }
    if (mode === 'smoke') { ctx.fillStyle = 'rgba(0,0,0,0.38)'; ctx.fillRect(0, 0, W, H); }
  } else if (mode === 'photo') {
    ctx.fillStyle = '#1c1c1e'; ctx.fillRect(0, 0, W, H);
    const img = getImg(w.photo);
    if (img) drawCover(ctx, img, 0, 0, W, H);
    else {
      ctx.fillStyle = '#8e8e93'; ctx.textAlign = 'center';
      ctx.font = `600 ${13 * u}px ${FONTS.system}`;
      ctx.fillText('Choose a photo', W / 2, H / 2 + 4 * u);
    }
  }

  const left = w.align !== 'center';
  const tx = left ? pad : W / 2;
  ctx.textAlign = left ? 'left' : 'center';
  ctx.fillStyle = w.fg;

  switch (w.type) {
    case 'quote': {
      const hasAuthor = !!w.author?.trim();
      const authorH = hasAuthor ? 22 * ts * u : 0;
      const mark = w.font === 'serif' ? '“' : '';
      const maxSize = (isSmall ? 22 : w.size === 'medium' ? 24 : 34) * u;
      const weight = w.font === 'serif' ? 500 : 650;
      const body = (mark && !w.quote.trim().startsWith('“') ? '“' : '') + w.quote.trim() + (mark && !w.quote.trim().endsWith('”') ? '”' : '');
      const { size, lines } = fitText(ctx, body || ' ', W - pad * 2, H - pad * 2 - authorH, maxSize, 9 * u, weight, fam, 1.18);
      const lh = size * 1.18;
      const blockH = lines.length * lh + authorH;
      let y = (H - blockH) / 2 + size * 0.95;
      ctx.font = `${weight} ${size}px ${fam}`;
      for (const l of lines) { ctx.fillText(l, tx, y); y += lh; }
      if (hasAuthor) {
        ctx.font = `600 ${Math.min(13 * ts * u, size * 0.8)}px ${fam}`;
        ctx.fillStyle = w.accent;
        ctx.fillText('— ' + w.author.trim(), tx, y - lh + size * 0.25 + authorH);
      }
      break;
    }

    case 'date': {
      const now = new Date();
      const wd = now.toLocaleDateString(undefined, { weekday: 'long' });
      const mo = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const big = isSmall ? 64 : w.size === 'medium' ? 72 : 120;
      const note = w.note?.trim();
      const total = (16 + 22 + (note ? 26 : 0)) * ts + big * 0.86;
      let y = (H / u - total) / 2;
      ctx.fillStyle = w.accent;
      ctx.font = `700 ${14 * ts * u}px ${fam}`;
      y += 14 * ts; ctx.fillText(wd.toUpperCase(), tx, y * u);
      ctx.fillStyle = w.fg;
      ctx.font = `${w.font === 'serif' ? 400 : 300} ${big * u}px ${fam}`;
      y += big * 0.86; ctx.fillText(String(now.getDate()), tx, y * u);
      ctx.font = `600 ${15 * ts * u}px ${fam}`;
      y += 24 * ts; ctx.fillText(mo, tx, y * u);
      if (note) {
        ctx.globalAlpha = 0.75;
        const t = fitText(ctx, note, W - pad * 2, 18 * ts * u, 13 * ts * u, 9 * u, 500, fam);
        ctx.font = `500 ${t.size}px ${fam}`;
        y += 24 * ts; ctx.fillText(t.lines[0], tx, y * u);
        ctx.globalAlpha = 1;
      }
      break;
    }

    case 'calendar': {
      const now = new Date();
      const yr = now.getFullYear(), mon = now.getMonth(), today = now.getDate();
      const first = new Date(yr, mon, 1).getDay();
      const offset = w.monday ? (first + 6) % 7 : first;
      const days = new Date(yr, mon + 1, 0).getDate();
      const rows = Math.ceil((offset + days) / 7);
      const letters = w.monday ? 'MTWTFSS' : 'SMTWTFS';
      let gx = pad, gw = W - pad * 2, gy = pad;
      ctx.textAlign = 'left';
      if (w.size === 'medium') {
        // Left: big date. Right: grid.
        ctx.fillStyle = w.accent; ctx.font = `700 ${13 * u}px ${fam}`;
        ctx.fillText(now.toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase(), pad, pad + 13 * u);
        ctx.fillStyle = w.fg; ctx.font = `300 ${70 * u}px ${fam}`;
        ctx.fillText(String(today), pad - 3 * u, pad + 82 * u);
        ctx.font = `600 ${14 * u}px ${fam}`;
        ctx.fillText(now.toLocaleDateString(undefined, { month: 'long' }), pad, H - pad);
        gx = W * 0.46; gw = W - gx - pad * 0.7;
      } else {
        ctx.fillStyle = w.accent;
        ctx.font = `700 ${(isSmall ? 12 : 17) * u}px ${fam}`;
        ctx.fillText(now.toLocaleDateString(undefined, { month: 'long' }).toUpperCase(), gx + 3 * u, gy + (isSmall ? 11 : 16) * u);
        gy += (isSmall ? 18 : 30) * u;
      }
      const cw = gw / 7;
      const gh = H - gy - pad * (w.size === 'medium' ? 1 : 0.75);
      const ch = gh / (rows + 1);
      const fs = Math.min(cw, ch) * (isSmall ? 0.62 : 0.5);
      ctx.textAlign = 'center';
      ctx.font = `700 ${fs * 0.85}px ${fam}`;
      ctx.globalAlpha = 0.55; ctx.fillStyle = w.fg;
      for (let i = 0; i < 7; i++) ctx.fillText(letters[i], gx + cw * (i + 0.5), gy + ch * 0.5 + fs * 0.32);
      ctx.globalAlpha = 1;
      ctx.font = `600 ${fs}px ${fam}`;
      for (let d = 1; d <= days; d++) {
        const idx = offset + d - 1;
        const cx = gx + cw * (idx % 7 + 0.5), cy = gy + ch * (Math.floor(idx / 7) + 1.5);
        if (d === today) {
          ctx.fillStyle = w.accent;
          ctx.beginPath(); ctx.arc(cx, cy, Math.min(cw, ch) * 0.46, 0, 7); ctx.fill();
          ctx.fillStyle = contrastText(w.accent);
        } else {
          ctx.fillStyle = w.fg;
          const wkd = (idx % 7);
          ctx.globalAlpha = (w.monday ? wkd >= 5 : wkd === 0 || wkd === 6) ? 0.6 : 1;
        }
        ctx.fillText(String(d), cx, cy + fs * 0.35);
        ctx.globalAlpha = 1;
      }
      break;
    }

    case 'countdown': {
      const target = new Date((w.eventDate || inAMonth) + 'T00:00:00');
      const t0 = new Date(); t0.setHours(0, 0, 0, 0);
      const diff = Math.round((target - t0) / 864e5);
      const n = Math.abs(diff);
      const unit = n === 1 ? 'day' : 'days';
      const label = diff > 0 ? `${unit} until` : diff < 0 ? `${unit} since` : 'Today is';
      const big = isSmall ? 66 : w.size === 'medium' ? 76 : 130;
      const ev = (w.event || 'the big day').trim();
      const total = big * 0.8 + 44 * ts;
      let y = (H / u - total) / 2 + big * 0.8;
      ctx.fillStyle = w.fg;
      ctx.font = `700 ${big * u}px ${fam}`;
      const numStr = diff === 0 ? '🎉' : String(n);
      const nw = ctx.measureText(numStr).width;
      if (nw > W - pad * 2) ctx.font = `700 ${big * u * (W - pad * 2) / nw}px ${fam}`;
      ctx.fillText(numStr, tx, y * u);
      ctx.fillStyle = w.accent;
      ctx.font = `600 ${14 * ts * u}px ${fam}`;
      y += 24 * ts; ctx.fillText(label, tx, y * u);
      ctx.fillStyle = w.fg;
      const t = fitText(ctx, ev, W - pad * 2, 20 * ts * u, 17 * ts * u, 10 * u, 700, fam);
      ctx.font = `700 ${t.size}px ${fam}`;
      y += 21 * ts; ctx.fillText(t.lines[0], tx, y * u);
      if (!isSmall) {
        ctx.globalAlpha = 0.6;
        ctx.font = `500 ${12 * ts * u}px ${fam}`;
        ctx.fillText(target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }), tx, y * u + 20 * ts * u);
        ctx.globalAlpha = 1;
      }
      break;
    }

    case 'text': {
      const sub = w.sub?.trim();
      const big = (w.big || '').trim() || '✦';
      const subH = sub ? 26 * ts * u : 0;
      const t = fitText(ctx, big, W - pad * 2, H - pad * 2 - subH, (isSmall ? 78 : w.size === 'medium' ? 84 : 150) * u, 14 * u, 700, fam, 1.05);
      const lh = t.size * 1.05;
      const block = t.lines.length * lh + subH;
      let y = (H - block) / 2 + t.size * 0.82;
      ctx.font = `700 ${t.size}px ${fam}`;
      for (const l of t.lines) { ctx.fillText(l, tx, y); y += lh; }
      if (sub) {
        ctx.fillStyle = w.accent;
        const s = fitText(ctx, sub, W - pad * 2, 20 * ts * u, 16 * ts * u, 9 * u, 600, fam);
        ctx.font = `600 ${s.size}px ${fam}`;
        ctx.fillText(s.lines[0], tx, y - lh + t.size * 0.18 + subH);
      }
      break;
    }

    case 'photo': {
      const cap = w.caption?.trim();
      if (cap) {
        const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = w.fg; ctx.textAlign = 'left';
        const s = fitText(ctx, cap, W - pad * 2, 24 * u, 17 * u, 10 * u, 700, fam);
        ctx.font = `700 ${s.size}px ${fam}`;
        ctx.fillText(s.lines[0], pad, H - pad);
      }
      break;
    }
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ *
 * Phone mock-up (home + lock screen)
 * ------------------------------------------------------------------ */

function renderMockup(ctx, W, H) {
  const s = W / PHONE_PT[0];
  ctx.drawImage(wallpaperAt(W), 0, 0, W, H);
  const fam = FONTS.system;
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M$/i, '');

  if (state.ui.screen === 'lock') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.textAlign = 'center';
    ctx.font = `600 ${18 * s}px ${fam}`;
    ctx.fillText(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }), W / 2, 112 * s);
    ctx.font = `700 ${96 * s}px ${FONTS.rounded}`;
    ctx.fillText(time, W / 2, 200 * s);
    for (const x of [64, PHONE_PT[0] - 64]) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.arc(x * s, (PHONE_PT[1] - 88) * s, 25 * s, 0, 7); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    roundRect(ctx, W / 2 - 70 * s, H - 14 * s, 140 * s, 5 * s, 3 * s); ctx.fill();
    statusBar(ctx, W, s, '');
    return;
  }

  statusBar(ctx, W, s, time);

  // Widget
  const [wpt, hpt] = WIDGET_PT[state.w.size];
  const wc = mkCanvas(wpt * s, hpt * s);
  renderWidget(ctx2d(wc), wc.width, wc.height, state.w);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 12 * s;
  roundRect(ctx, SLOT.x * s, SLOT.y * s, wpt * s, hpt * s, 22 * s);
  ctx.fillStyle = '#000'; ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, SLOT.x * s, SLOT.y * s, wpt * s, hpt * s, 22 * s);
  ctx.clip(); ctx.drawImage(wc, SLOT.x * s, SLOT.y * s);
  ctx.restore();

  // Icon grid: 4 columns, row pitch matches a 2-row small widget.
  const colW = 364 / 4, icon = 62, pitch = 97;
  const rowsTaken = state.w.size === 'large' ? 4 : 2;
  const colsTaken = state.w.size === 'small' ? 2 : 4;
  const r = rng(3);
  const dockY = PHONE_PT[1] - 110;
  for (let row = 0; row < 7; row++) {
    const y = SLOT.y + row * pitch + 4;
    if (y + icon + 18 > dockY - 30) break;
    for (let col = 0; col < 4; col++) {
      if (row < rowsTaken && col < colsTaken) continue;
      const x = SLOT.x + col * colW + (colW - icon) / 2;
      drawIcon(ctx, x * s, y * s, icon * s, r);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      roundRect(ctx, (x + 14) * s, (y + icon + 7) * s, (icon - 28) * s, 5 * s, 2.5 * s); ctx.fill();
    }
  }
  // Page dots
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, W / 2 - 30 * s, (dockY - 34) * s, 60 * s, 24 * s, 12 * s); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.arc(W / 2 - 8 * s, (dockY - 22) * s, 3.5 * s, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.arc(W / 2 + 8 * s, (dockY - 22) * s, 3.5 * s, 0, 7); ctx.fill();

  // Dock (frosted)
  const dx = 12 * s, dy = dockY * s, dw = W - 24 * s, dh = 92 * s;
  ctx.save();
  roundRect(ctx, dx, dy, dw, dh, 34 * s); ctx.clip();
  const blurred = wallpaperAt(W / 2, { blur: 10 });
  ctx.drawImage(blurred, 0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(dx, dy, dw, dh);
  ctx.restore();
  for (let col = 0; col < 4; col++) {
    const x = SLOT.x + col * colW + (colW - icon) / 2;
    drawIcon(ctx, x * s, (dockY + 15) * s, icon * s, r);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  roundRect(ctx, W / 2 - 70 * s, H - 12 * s, 140 * s, 5 * s, 3 * s); ctx.fill();
}

function drawIcon(ctx, x, y, size, r) {
  const hue = Math.floor(r() * 360);
  const g = ctx.createLinearGradient(x, y, x, y + size);
  g.addColorStop(0, `hsla(${hue},70%,72%,0.95)`);
  g.addColorStop(1, `hsla(${(hue + 20) % 360},70%,55%,0.95)`);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, size, size, size * 0.225); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const k = Math.floor(r() * 3), c = size / 2;
  ctx.beginPath();
  if (k === 0) ctx.arc(x + c, y + c, size * 0.2, 0, 7);
  else if (k === 1) roundRect(ctx, x + size * 0.3, y + size * 0.3, size * 0.4, size * 0.4, size * 0.08);
  else { ctx.moveTo(x + c, y + size * 0.27); ctx.lineTo(x + size * 0.73, y + size * 0.7); ctx.lineTo(x + size * 0.27, y + size * 0.7); ctx.closePath(); }
  ctx.fill();
}

function statusBar(ctx, W, s, time) {
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `600 ${16 * s}px ${FONTS.system}`;
  if (time) ctx.fillText(time, 62 * s, 33 * s);
  // Dynamic Island
  ctx.fillStyle = '#000';
  roundRect(ctx, W / 2 - 62 * s, 11 * s, 124 * s, 36 * s, 18 * s); ctx.fill();
  // Signal / battery
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 4; i++) roundRect(ctx, (300 + i * 5) * s, (28 - i * 2.5) * s, 3 * s, (5 + i * 2.5) * s, 1 * s), ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1 * s;
  roundRect(ctx, 330 * s, 22 * s, 25 * s, 12 * s, 3.5 * s); ctx.stroke();
  roundRect(ctx, 332 * s, 24 * s, 18 * s, 8 * s, 2 * s); ctx.fill();
}

/* ------------------------------------------------------------------ *
 * Scriptable (live widget) code
 * ------------------------------------------------------------------ */

function scriptableCode(w) {
  const J = JSON.stringify;
  const fontFn = (size, bold = true) => {
    if (w.font === 'rounded') return `Font.${bold ? 'bold' : 'regular'}RoundedSystemFont(${size})`;
    if (w.font === 'mono') return `Font.${bold ? 'bold' : 'regular'}MonospacedSystemFont(${size})`;
    if (w.font === 'serif') return `new Font(${J(bold ? 'Georgia-Bold' : 'Georgia')}, ${size})`;
    return `Font.${bold ? 'bold' : ''}${bold ? 'SystemFont' : 'systemFont'}(${size})`;
  };
  const bg = w.bgMode === 'solid'
    ? `w.backgroundColor = new Color(${J(w.c0)});`
    : `const g = new LinearGradient();\ng.colors = [new Color(${J(w.c0)}), new Color(${J(w.c1)})];\ng.locations = [0, 1];\ng.startPoint = new Point(0, 0);\ng.endPoint = new Point(1, 1);\nw.backgroundGradient = g;`;
  const align = w.align === 'center' ? 'centerAlignText()' : 'leftAlignText()';
  const sizeName = w.size[0].toUpperCase() + w.size.slice(1);
  const big = w.size === 'large' ? 1.7 : 1;

  let body = '';
  if (w.type === 'quote') {
    body = `const quote = ${J(w.quote.trim())};
const author = ${J((w.author || '').trim())};
w.addSpacer();
const q = w.addText(quote);
q.font = ${fontFn(Math.round(18 * big), true)};
q.textColor = FG;
q.minimumScaleFactor = 0.4;
q.${align};
if (author) {
  w.addSpacer(6);
  const a = w.addText("— " + author);
  a.font = ${fontFn(12, true)};
  a.textColor = ACCENT;
  a.${align};
}
w.addSpacer();`;
  } else if (w.type === 'date') {
    body = `const now = new Date();
const df = new DateFormatter();
w.addSpacer();
df.dateFormat = "EEEE";
const wd = w.addText(df.string(now).toUpperCase());
wd.font = ${fontFn(13, true)};
wd.textColor = ACCENT;
wd.${align};
const d = w.addText(String(now.getDate()));
d.font = ${fontFn(Math.round(56 * big), false)};
d.textColor = FG;
d.${align};
df.dateFormat = "MMMM yyyy";
const m = w.addText(df.string(now));
m.font = ${fontFn(14, true)};
m.textColor = FG;
m.${align};
${w.note?.trim() ? `const n = w.addText(${J(w.note.trim())});\nn.font = ${fontFn(12, false)};\nn.textColor = FG;\nn.textOpacity = 0.75;\nn.${align};\n` : ''}w.addSpacer();`;
  } else if (w.type === 'countdown') {
    body = `const target = new Date(${J((w.eventDate || inAMonth) + 'T00:00:00')});
const today = new Date(); today.setHours(0, 0, 0, 0);
const diff = Math.round((target - today) / 86400000);
const n = Math.abs(diff);
w.addSpacer();
const num = w.addText(diff === 0 ? "🎉" : String(n));
num.font = ${fontFn(Math.round(56 * big), true)};
num.textColor = FG;
num.minimumScaleFactor = 0.5;
num.${align};
const unit = n === 1 ? "day" : "days";
const lbl = w.addText(diff > 0 ? unit + " until" : diff < 0 ? unit + " since" : "Today is");
lbl.font = ${fontFn(13, true)};
lbl.textColor = ACCENT;
lbl.${align};
const ev = w.addText(${J((w.event || 'the big day').trim())});
ev.font = ${fontFn(16, true)};
ev.textColor = FG;
ev.lineLimit = 1;
ev.minimumScaleFactor = 0.6;
ev.${align};
w.addSpacer();`;
  } else if (w.type === 'text') {
    body = `w.addSpacer();
const big = w.addText(${J((w.big || '✦').trim())});
big.font = ${fontFn(Math.round(54 * big), true)};
big.textColor = FG;
big.minimumScaleFactor = 0.3;
big.${align};
${w.sub?.trim() ? `const sub = w.addText(${J(w.sub.trim())});\nsub.font = ${fontFn(14, true)};\nsub.textColor = ACCENT;\nsub.${align};\n` : ''}w.addSpacer();`;
  }

  return `// ${sizeName} widget made with Zwave Studio
// Paste into a new script in the Scriptable app, then add a
// Scriptable widget (${w.size}) to your home screen and choose this script.
const FG = new Color(${J(w.fg)});
const ACCENT = new Color(${J(w.accent)});
const w = new ListWidget();
${bg}
w.setPadding(16, 16, 16, 16);

${body}

// Refresh just after midnight so dates stay current.
const next = new Date(); next.setHours(24, 0, 5, 0);
w.refreshAfterDate = next;

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.present${sizeName}();
}
Script.complete();
`;
}

/* ------------------------------------------------------------------ *
 * Rendering loop
 * ------------------------------------------------------------------ */

const bgCanvas = $('#bg-canvas');
const wCanvas = $('#w-canvas');
const pCanvas = $('#p-canvas');
let renderQueued = false;

function scheduleRender() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => { renderQueued = false; renderActive(); });
}

function previewWidth(canvas, aspect) {
  const stage = canvas.parentElement;
  const sh = stage.clientHeight - 28, sw = stage.clientWidth - 32;
  const cssW = Math.max(60, Math.min(sw, sh / aspect));
  return Math.round(cssW * Math.min(2, window.devicePixelRatio || 1));
}

function renderActive() {
  const tab = state.ui.tab;
  const dev = deviceSize(state.bg.device);
  if (tab === 'bg') {
    const pw = previewWidth(bgCanvas, dev.h / dev.w);
    bgCanvas.width = pw; bgCanvas.height = Math.round(pw * dev.h / dev.w);
    renderBackground(ctx2d(bgCanvas), bgCanvas.width, bgCanvas.height, state.bg);
  } else if (tab === 'w') {
    const [wp, hp] = WIDGET_PT[state.w.size];
    wCanvas.width = wp * WIDGET_SCALE; wCanvas.height = hp * WIDGET_SCALE;
    wCanvas.className = 'widget-canvas' + (state.w.size === 'medium' ? ' wide' : state.w.size === 'large' ? ' large' : '');
    const stage = $('#widget-stage');
    const maxW = stage.clientWidth - 48, maxH = stage.clientHeight - 48;
    const k = Math.min(maxW / wp, maxH / hp, 1.6);
    wCanvas.style.width = Math.round(wp * k) + 'px';
    wCanvas.style.height = Math.round(hp * k) + 'px';
    renderWidget(ctx2d(wCanvas), wCanvas.width, wCanvas.height, state.w);
    updateStageBackdrop();
  } else if (tab === 'p') {
    const aspect = PHONE_PT[1] / PHONE_PT[0];
    const pw = previewWidth(pCanvas, aspect);
    pCanvas.width = pw; pCanvas.height = Math.round(pw * aspect);
    renderMockup(ctx2d(pCanvas), pCanvas.width, pCanvas.height);
  }
}

let backdropVersion = -1;
function updateStageBackdrop() {
  if (backdropVersion === bgVersion) return;
  backdropVersion = bgVersion;
  const c = wallpaperAt(160, { noText: true });
  $('#widget-stage').style.backgroundImage = `url(${c.toDataURL('image/jpeg', 0.8)})`;
}

/* ------------------------------------------------------------------ *
 * Export
 * ------------------------------------------------------------------ */

function fullRender() {
  const tab = state.ui.tab;
  if (tab === 'w') {
    const [wp, hp] = WIDGET_PT[state.w.size];
    const c = mkCanvas(wp * WIDGET_SCALE, hp * WIDGET_SCALE);
    renderWidget(ctx2d(c), c.width, c.height, state.w);
    return { canvas: c, name: `widget-${state.w.type}-${state.w.size}.png` };
  }
  if (tab === 'p') {
    const c = mkCanvas(PHONE_PT[0] * 3, PHONE_PT[1] * 3);
    renderMockup(ctx2d(c), c.width, c.height);
    return { canvas: c, name: 'preview.png' };
  }
  const dev = deviceSize(state.bg.device);
  const c = mkCanvas(dev.w, dev.h);
  renderBackground(ctx2d(c), c.width, c.height, state.bg);
  return { canvas: c, name: `wallpaper-${state.bg.style}-${dev.w}x${dev.h}.png` };
}

let lastExport = null;
async function doExport() {
  const btn = $('#btn-export');
  btn.disabled = true; btn.textContent = 'Rendering…';
  await new Promise(r => setTimeout(r, 30));
  try {
    const { canvas, name } = fullRender();
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    if (!blob) throw new Error('Could not create the image.');
    if (lastExport?.url) URL.revokeObjectURL(lastExport.url);
    const url = URL.createObjectURL(blob);
    lastExport = { blob, url, name };
    $('#sheet-img').src = url;
    $('#sheet-download').href = url;
    $('#sheet-download').download = name;
    $('#sheet-title').textContent = state.ui.tab === 'w' ? 'Widget image' : state.ui.tab === 'p' ? 'Preview' : 'Wallpaper';
    $('#sheet-share').hidden = !canShareFiles(blob, name);
    $('#sheet').hidden = false;
  } catch (e) {
    toast(e.message || 'Export failed');
  } finally {
    btn.disabled = false; btn.textContent = 'Export';
  }
}
function canShareFiles(blob, name) {
  try { return !!navigator.canShare?.({ files: [new File([blob], name, { type: blob.type })] }); }
  catch { return false; }
}
async function shareLast() {
  if (!lastExport) return;
  const file = new File([lastExport.blob], lastExport.name, { type: 'image/png' });
  try { await navigator.share({ files: [file] }); }
  catch (e) { if (e.name !== 'AbortError') toast('Sharing failed — touch and hold the image instead.'); }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { /* ignore */ }
    ta.remove();
    return ok;
  }
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ------------------------------------------------------------------ *
 * Library (IndexedDB)
 * ------------------------------------------------------------------ */

const DB = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      let req;
      try { req = indexedDB.open('zwave-studio', 1); } catch (e) { rej(e); return; }
      req.onupgradeneeded = () => req.result.createObjectStore('items', { keyPath: 'id' });
      req.onsuccess = () => { this.db = req.result; res(this.db); };
      req.onerror = () => rej(req.error);
    });
  },
  async tx(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction('items', mode);
      const out = fn(t.objectStore('items'));
      t.oncomplete = () => res(out?.result ?? out);
      t.onerror = () => rej(t.error);
    });
  },
  all() { return this.tx('readonly', s => s.getAll()); },
  put(item) { return this.tx('readwrite', s => s.put(item)); },
  del(id) { return this.tx('readwrite', s => s.delete(id)); },
};

async function saveToLibrary() {
  const tab = state.ui.tab;
  if (tab !== 'bg' && tab !== 'w') return;
  let thumb;
  if (tab === 'bg') {
    const dev = deviceSize(state.bg.device);
    const c = mkCanvas(240, 240 * dev.h / dev.w);
    renderBackground(ctx2d(c), c.width, c.height, state.bg);
    thumb = c.toDataURL('image/jpeg', 0.85);
  } else {
    const [wp, hp] = WIDGET_PT[state.w.size];
    const c = mkCanvas(wp * 1.5, hp * 1.5);
    const x = ctx2d(c);
    roundRect(x, 0, 0, c.width, c.height, 22 * 1.5); x.clip();
    renderWidget(x, c.width, c.height, state.w);
    thumb = c.toDataURL('image/png');
  }
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    kind: tab, cfg: JSON.parse(JSON.stringify(tab === 'bg' ? state.bg : state.w)),
    bg: tab === 'w' ? JSON.parse(JSON.stringify(state.bg)) : undefined,
    thumb, created: Date.now(),
  };
  try { await DB.put(item); toast('Saved to library'); }
  catch { toast('Could not save — storage is unavailable in this browser mode.'); }
}

async function renderLibrary() {
  const grid = $('#lib-grid');
  let items = [];
  try { items = await DB.all(); } catch { /* unavailable */ }
  items.sort((a, b) => b.created - a.created);
  grid.innerHTML = '';
  $('#lib-empty').hidden = items.length > 0;
  for (const it of items) {
    const el = document.createElement('div');
    el.className = 'lib-item' + (it.kind === 'w' ? ' widget' : '');
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.innerHTML = `<img alt=""><span class="badge">${it.kind === 'w' ? 'Widget' : 'Wallpaper'}</span><button class="del" aria-label="Delete">×</button>`;
    el.querySelector('img').src = it.thumb;
    el.addEventListener('click', e => {
      if (e.target.closest('.del')) return;
      if (it.kind === 'bg') { Object.assign(state.bg, DEFAULT_BG, it.cfg); bgVersion++; }
      else {
        Object.assign(state.w, DEFAULT_W, it.cfg);
        if (it.bg && ['wallpaper', 'glass', 'smoke'].includes(it.cfg.bgMode)) { Object.assign(state.bg, DEFAULT_BG, it.bg); bgVersion++; }
      }
      syncUI(); persist();
      setTab(it.kind);
    });
    el.querySelector('.del').addEventListener('click', async () => {
      if (!confirm('Delete this design?')) return;
      await DB.del(it.id).catch(() => {});
      renderLibrary();
    });
    grid.appendChild(el);
  }
}

/* ------------------------------------------------------------------ *
 * UI binding
 * ------------------------------------------------------------------ */

function getPath(path) { const [o, k] = path.split('.'); return state[o][k]; }
function setPath(path, v) {
  const [o, k] = path.split('.');
  state[o][k] = v;
  if (o === 'bg') bgVersion++;
}

function syncUI() {
  for (const el of $$('[data-k]')) {
    const v = getPath(el.dataset.k);
    if (el.matches('.chips, .segmented')) {
      for (const b of $$('button', el)) b.classList.toggle('on', b.dataset.v === String(v));
    } else if (el.type === 'checkbox') el.checked = !!v;
    else if (document.activeElement !== el) el.value = v ?? '';
  }
  for (const el of $$('[data-when]')) {
    const [path, list] = el.dataset.when.split(':');
    const v = String(getPath(path) ?? '');
    let show;
    if (list === '?') show = v.trim().length > 0;
    else if (list.startsWith('!')) show = !list.slice(1).split(',').includes(v);
    else show = list.split(',').includes(v);
    el.hidden = !show;
  }
  const dev = deviceSize(state.bg.device);
  $('#device-hint').textContent = `Exports at ${dev.w} × ${dev.h} px` + (state.bg.device === 'auto' ? ` (${dev.name})` : '');
  scheduleRender();
}

function bindControls() {
  for (const el of $$('[data-k]')) {
    if (el.matches('.chips, .segmented')) {
      el.addEventListener('click', e => {
        const b = e.target.closest('button[data-v]');
        if (!b) return;
        setPath(el.dataset.k, b.dataset.v);
        syncUI(); persist();
      });
      continue;
    }
    const handler = () => {
      let v = el.value;
      if (el.type === 'range') v = Number(v);
      if (el.type === 'checkbox') v = el.checked;
      setPath(el.dataset.k, v);
      if (el.dataset.k.startsWith('bg.') && el.type === 'color') bgVersion++;
      syncUI(); persist();
    };
    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  }

  // Palettes
  for (const box of $$('[data-palette]')) {
    const target = box.dataset.palette;
    PALETTES.forEach(p => {
      const b = document.createElement('button');
      b.style.background = `linear-gradient(135deg, ${p[0]} 0 25%, ${p[1]} 25% 50%, ${p[2]} 50% 75%, ${p[3]} 75%)`;
      b.setAttribute('aria-label', 'Palette ' + p.join(' '));
      b.addEventListener('click', () => { applyPalette(target, p); syncUI(); persist(); });
      box.appendChild(b);
    });
  }

  // Photos
  for (const input of $$('[data-photo]')) {
    input.addEventListener('change', async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        const data = await loadPhoto(f);
        const tgt = input.dataset.photo;
        state[tgt].photo = data;
        if (tgt === 'bg') { state.bg.style = 'photo'; bgVersion++; }
        syncUI(); persist();
      } catch { toast('Could not read that photo.'); }
      input.value = '';
    });
  }

  // Device list
  const sel = $('#device-select');
  for (const d of DEVICES) {
    const o = document.createElement('option');
    o.value = d.id; o.textContent = d.w ? `${d.name} — ${d.w}×${d.h}` : d.name;
    sel.appendChild(o);
  }

  $('#btn-shuffle-colors').addEventListener('click', () => {
    const c = [state.bg.c0, state.bg.c1, state.bg.c2, state.bg.c3];
    for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
    [state.bg.c0, state.bg.c1, state.bg.c2, state.bg.c3] = c;
    bgVersion++; syncUI(); persist();
  });
  $('#btn-reseed').addEventListener('click', () => {
    state.bg.seed = Math.floor(Math.random() * 1e6); bgVersion++; syncUI(); persist();
  });
  $('#btn-match').addEventListener('click', () => {
    const b = state.bg;
    Object.assign(state.w, { c0: b.c1, c1: b.c2, accent: b.c3 });
    state.w.fg = contrastText(mix(state.w.c0, state.w.c1, 0.5));
    if (lum(state.w.accent) > 0.85 && state.w.fg === '#ffffff') state.w.accent = b.c2;
    syncUI(); persist(); toast('Colors matched to your background');
  });
  $('#btn-script').addEventListener('click', async () => {
    const ok = await copyText(scriptableCode(state.w));
    toast(ok ? 'Script copied — paste it into Scriptable' : 'Copy failed');
  });

  $('#btn-random').addEventListener('click', randomize);
  $('#btn-save').addEventListener('click', saveToLibrary);
  $('#btn-export').addEventListener('click', doExport);
  $('#sheet-close').addEventListener('click', () => { $('#sheet').hidden = true; });
  $('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') $('#sheet').hidden = true; });
  $('#sheet-share').addEventListener('click', shareLast);

  for (const t of $$('.tab')) t.addEventListener('click', () => setTab(t.dataset.tab));
  window.addEventListener('resize', scheduleRender);
}

function applyPalette(target, p) {
  if (target === 'bg') {
    [state.bg.c0, state.bg.c1, state.bg.c2, state.bg.c3] = p;
    bgVersion++;
  } else {
    state.w.c0 = p[0]; state.w.c1 = p[2];
    state.w.fg = contrastText(mix(p[0], p[2], 0.5));
    state.w.accent = Math.abs(lum(p[3]) - lum(mix(p[0], p[2], 0.5))) > 0.25 ? p[3] : p[1];
  }
}

function loadPhoto(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 2200;
      const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = mkCanvas(img.naturalWidth * k, img.naturalHeight * k);
      ctx2d(c).drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}

function randomize() {
  const tab = state.ui.tab;
  const p = PALETTES[Math.floor(Math.random() * PALETTES.length)];
  if (tab === 'w') {
    applyPalette('w', p);
    const modes = ['gradient', 'gradient', 'solid', 'glass', 'smoke', 'wallpaper'];
    state.w.bgMode = modes[Math.floor(Math.random() * modes.length)];
    state.w.font = ['system', 'rounded', 'serif', 'mono'][Math.floor(Math.random() * 4)];
    if (state.w.type === 'quote') {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      state.w.quote = q[0]; state.w.author = q[1];
    }
  } else {
    const keepPhoto = state.bg.style === 'photo' && state.bg.photo;
    applyPalette('bg', [...p].sort(() => Math.random() - 0.5));
    if (!keepPhoto) state.bg.style = BG_STYLES[Math.floor(Math.random() * BG_STYLES.length)];
    state.bg.seed = Math.floor(Math.random() * 1e6);
    state.bg.angle = Math.floor(Math.random() * 360);
    state.bg.detail = 2 + Math.floor(Math.random() * 7);
    state.bg.soft = 30 + Math.floor(Math.random() * 60);
    bgVersion++;
  }
  syncUI(); persist();
}

const TITLES = { bg: 'Backgrounds', w: 'Widgets', p: 'Preview', lib: 'Saved' };
function setTab(tab) {
  state.ui.tab = tab;
  for (const t of $$('.tab')) t.classList.toggle('active', t.dataset.tab === tab);
  for (const v of $$('.view')) v.classList.toggle('active', v.id === 'view-' + tab);
  $('#title').textContent = TITLES[tab];
  $('.actions').hidden = tab === 'lib';
  $('#btn-random').hidden = tab === 'p';
  $('#btn-save').hidden = tab === 'p';
  if (tab === 'lib') renderLibrary();
  persist();
  scheduleRender();
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

loadState();
bindControls();
syncUI();
setTab(state.ui.tab === 'lib' ? 'bg' : state.ui.tab);
// Keep the mock-up clock honest.
setInterval(() => { if (state.ui.tab === 'p') scheduleRender(); }, 30000);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Expose for tests/debugging.
window.ZW = { state, renderBackground, renderWidget, scriptableCode, setTab };
})();
