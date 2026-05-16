// ─── Ticker animado Kohan & Campos ─────────────────────────────
// Franja navy con marquee CSS — aparece al pie de todas las páginas públicas

const ITEMS = [
  "Real Estate Asunción",
  "Villa Morra",
  "San Bernardino",
  "Las Mercedes",
  "Recoleta",
  "Mariano Roque Alonso",
  "Luque",
  "Carmelitas",
  "Comprá · Alquilá · Invertí",
];

const LOGO_URL = "https://kohancampos.com.py/logo-navbar.svg";
const NAVY = "#1E3A5F";
const GOLD = "#C9A96E";

function TickerContent() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-4 shrink-0">
          <img
            src={LOGO_URL}
            alt="Kohan & Campos"
            className="h-3.5 brightness-0 invert opacity-60 shrink-0"
          />
          <span
            className="text-[10px] font-medium uppercase tracking-[0.18em] whitespace-nowrap"
            style={{ color: GOLD }}
          >
            {item}
          </span>
          <span className="text-white/20 text-xs shrink-0">·</span>
        </span>
      ))}
    </>
  );
}

export function KohanTicker() {
  return (
    <div
      className="w-full overflow-hidden border-t"
      style={{ background: NAVY, borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div
        className="flex items-center h-9 animate-marquee"
        style={{ width: "max-content" }}
      >
        {/* Dos copias para loop seamless */}
        <div className="flex items-center gap-6 px-6">
          <TickerContent />
        </div>
        <div className="flex items-center gap-6 px-6" aria-hidden>
          <TickerContent />
        </div>
      </div>
    </div>
  );
}
