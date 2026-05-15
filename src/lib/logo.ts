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
  return `data:image/svg+xml;base64,${Buffer.from(ORIGINAL_SVG).toString("base64")}`;
}
