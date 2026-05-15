// ─── Logo Kohan & Campos — server-side inline SVG ───────────
// Se obtiene del SVG original de kohancampos.com.py y se
// reemplaza la fuente por una genérica para que renderice
// siempre, sin depender de fuentes externas.
// ───────────────────────────────────────────────────────────────

const ORIGINAL_SVG = `<svg id="Capa_2" data-name="Capa 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 425.69 35.34">
  <defs>
    <style>
      .cls-1 {
        fill: #ffffff;
        font-family: "Arial Black", Arial, Helvetica, sans-serif;
        font-size: 32.14px;
        font-weight: 900;
      }
      .cls-2 { letter-spacing: .3em; }
      .cls-3 { letter-spacing: .32em; }
      .cls-4 { letter-spacing: .2em; }
    </style>
  </defs>
  <g id="Capa_1-2" data-name="Capa 1">
    <text class="cls-1" transform="translate(0 27.34)">
      <tspan class="cls-4" x="0" y="0">K</tspan>
      <tspan class="cls-2" x="27.55" y="0">OHAN &amp;</tspan>
      <tspan class="cls-3" x="205.87" y="0"> </tspan>
      <tspan class="cls-2" x="226.44" y="0">CAMPOS</tspan>
    </text>
  </g>
</svg>`;

export function getLogoSvg(): string {
  return ORIGINAL_SVG;
}

/** Retorna un data URI del logo listo para <img src={...}> */
export function getLogoDataUri(): string {
  // Base64 manual sin depender de Buffer (compatible con Edge Runtime)
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const bytes = new TextEncoder().encode(ORIGINAL_SVG);
  let result = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i], b2 = bytes[i + 1] || 0, b3 = bytes[i + 2] || 0;
    result += chars[b1 >> 2] + chars[((b1 & 3) << 4) | (b2 >> 4)] + chars[((b2 & 15) << 2) | (b3 >> 6)] + chars[b3 & 63];
  }
  // Fix padding
  const pad = bytes.length % 3;
  if (pad === 1) result = result.slice(0, -2) + "==";
  else if (pad === 2) result = result.slice(0, -1) + "=";
  return `data:image/svg+xml;base64,${result}`;
}
