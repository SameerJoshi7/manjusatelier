import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

// Warm, on-brand palette pairs (gradients) for placeholders.
const palettes = [
  ['#EADBC8', '#8B5E3C'],
  ['#F0E4D3', '#5E7C5A'],
  ['#E7D3B8', '#A97B5A'],
  ['#Dfe0d0', '#5E7C5A'],
  ['#F3E3CE', '#6E4A2E'],
  ['#EAD9C0', '#8B5E3C'],
];

function pick(seed) {
  const hash = crypto.createHash('md5').update(String(seed)).digest();
  return palettes[hash[0] % palettes.length];
}

function escapeXml(s = '') {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c])
  );
}

/**
 * GET /api/placeholder?w=900&h=900&seed=abc&label=Resin%20Clock
 * Returns a deterministic, warm-toned SVG placeholder. No external deps.
 */
router.get('/', (req, res) => {
  const w = Math.min(2000, Math.max(40, Number(req.query.w) || 800));
  const h = Math.min(2000, Math.max(40, Number(req.query.h) || 800));
  const seed = String(req.query.seed || 'manjus');
  const label = escapeXml(String(req.query.label || '').slice(0, 40));
  const [c1, c2] = pick(seed);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g fill="none" stroke="#FFF8F2" stroke-opacity="0.18" stroke-width="2">
    <circle cx="${w * 0.5}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.28}"/>
    <circle cx="${w * 0.5}" cy="${h * 0.45}" r="${Math.min(w, h) * 0.18}"/>
  </g>
  <text x="50%" y="${h * 0.46}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(w, h) * 0.2}" fill="#FFF8F2" fill-opacity="0.85">M</text>
  ${
    label
      ? `<text x="50%" y="${h * 0.62}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.min(w, h) * 0.055}" fill="#FFF8F2" fill-opacity="0.9">${label}</text>`
      : ''
  }
</svg>`;

  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(svg);
});

export default router;
