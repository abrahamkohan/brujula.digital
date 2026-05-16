// ─── CTA compacto Kohan & Campos — reemplaza el bloque grande ──
// Franja horizontal, navy + gold, con logo hero y botón WhatsApp

import { MessageCircle } from "lucide-react";

const LOGO_HERO = "https://kohancampos.com.py/logo-hero.svg";
const NAVY = "#1E3A5F";
const GOLD = "#C9A96E";
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595976227373";

interface Props {
  zona: string;
}

export function KohanCtaCompact({ zona }: Props) {
  const msg = encodeURIComponent(
    `Hola, vi la guía de ${zona} en Brújula Digital y me interesa saber sobre propiedades en la zona.`
  );

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 sm:gap-6 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01]"
      style={{ background: NAVY }}
    >
      {/* Logo strip */}
      <div
        className="shrink-0 px-5 py-5 flex flex-col items-center justify-center gap-1 border-r"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <img
          src={LOGO_HERO}
          alt="Kohan & Campos Real Estate"
          className="h-8 brightness-0 invert"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* Texto */}
      <div className="flex-1 py-5 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">
          ¿Buscás propiedad en{" "}
          <span style={{ color: GOLD }}>{zona}</span>?
        </p>
        <p className="text-white/40 text-xs mt-0.5 hidden sm:block">
          Consultá sin compromiso · Respuesta rápida
        </p>
      </div>

      {/* Botón */}
      <div className="shrink-0 pr-5 py-5">
        <span
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-opacity group-hover:opacity-90"
          style={{ background: "#25D366", color: "#fff" }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sm:hidden">Consultar</span>
        </span>
      </div>
    </a>
  );
}
