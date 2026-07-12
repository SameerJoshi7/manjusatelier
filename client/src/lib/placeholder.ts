// Deterministic, on-brand SVG placeholders rendered as inline data URIs.
// Zero network requests, so they always render (offline-friendly).

const palettes: [string, string][] = [
  ['#EADBC8', '#8B5E3C'],
  ['#F0E4D3', '#5E7C5A'],
  ['#E7D3B8', '#A97B5A'],
  ['#DFE0D0', '#5E7C5A'],
  ['#F3E3CE', '#6E4A2E'],
  ['#EAD9C0', '#8B5E3C'],
];

function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function esc(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string)
  );
}

export function placeholder(seed: string, w = 800, h = 800, label = ''): string {
  const [c1, c2] = palettes[hash(seed) % palettes.length];
  const min = Math.min(w, h);
  const lbl = esc(label).slice(0, 40);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<g fill="none" stroke="#FFF8F2" stroke-opacity="0.18" stroke-width="2"><circle cx="${w * 0.5}" cy="${h * 0.45}" r="${min * 0.28}"/><circle cx="${w * 0.5}" cy="${h * 0.45}" r="${min * 0.18}"/></g>
<text x="50%" y="${h * 0.46}" text-anchor="middle" font-family="Georgia, serif" font-size="${min * 0.2}" fill="#FFF8F2" fill-opacity="0.85">M</text>
${lbl ? `<text x="50%" y="${h * 0.62}" text-anchor="middle" font-family="Georgia, serif" font-size="${min * 0.055}" fill="#FFF8F2" fill-opacity="0.9">${lbl}</text>` : ''}
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
