"use client";

import Link from "next/link";
import { Calendar, MapPin, Music, Trophy, Building2, Users, Sparkles, Film, Clapperboard, Share2 } from "lucide-react";

interface Evento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  venue: string;
  image_url?: string | null;
  source_url?: string | null;
  zona?: string;
}

interface Props {
  event: Evento;
  featured?: boolean;
  href?: string;
}

const CAT_META: Record<string, { icon: typeof Music; label: string }> = {
  concierto:        { icon: Music,        label: "Concierto" },
  deporte:          { icon: Trophy,       label: "Deporte" },
  teatro:           { icon: Film,         label: "Teatro" },
  feria:            { icon: Building2,    label: "Feria" },
  entretenimiento:  { icon: Sparkles,     label: "Entretenimiento" },
  congreso:         { icon: Users,        label: "Congreso" },
  cine:             { icon: Clapperboard, label: "Cine" },
};

const GRADIENT_STYLES: Record<string, string> = {
  concierto:       "linear-gradient(135deg, #7c3aed, #db2777)",
  deporte:         "linear-gradient(135deg, #059669, #0891b2)",
  teatro:          "linear-gradient(135deg, #7c3aed, #a855f7)",
  feria:           "linear-gradient(135deg, #d97706, #dc2626)",
  entretenimiento: "linear-gradient(135deg, #db2777, #ef4444)",
  congreso:        "linear-gradient(135deg, #2563eb, #4f46e5)",
  cine:            "linear-gradient(135deg, #d97706, #f59e0b)",
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(dateStr: string) {
  // Parsear directo del string para evitar el offset UTC→local (Paraguay = UTC-4)
  // new Date("2026-05-17") = UTC midnight → local getDate() = 16 en UTC-4
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const currentYear = new Date().getFullYear();
  return `${day} ${MONTHS[month]}${year !== currentYear ? ` ${year}` : ""}`;
}

function isToday(dateStr: string) {
  const now = new Date();
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return dateStr === todayISO;
}

export default function EventCard({ event, featured, href }: Props) {
  const cat = CAT_META[event.categoria?.toLowerCase()] ?? { icon: Calendar, label: "Evento" };
  const Icon = cat.icon;
  const gradStyle = GRADIENT_STYLES[event.categoria?.toLowerCase()] ?? "linear-gradient(135deg, #6b7280, #4b5563)";
  const hoy = isToday(event.fecha);
  const hasImage =
    event.image_url?.startsWith("http") &&
    !event.image_url.includes("ticketea.com.py") &&
    !event.image_url.includes("tuti.com.py") &&
    !event.image_url.includes("data:");

  const content = (
    <div className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
      <div className={`relative ${featured ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
        {hasImage ? (
          <img
            src={event.image_url!}
            alt={event.titulo}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(ev) => {
              const el = ev.target as HTMLImageElement;
              el.style.display = "none";
              const p = el.parentElement!;
              p.style.background = gradStyle;
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: gradStyle }}>
            <Icon className="h-12 w-12 text-white/40" strokeWidth={1.2} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide bg-white/20 backdrop-blur-sm text-white shadow-xs">
          <Icon className="h-3 w-3" />
          {cat.label}
        </span>

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {hoy && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C96442] text-white shadow-xs animate-pulse">
              Hoy
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const text = encodeURIComponent(`📍 ${event.titulo}\n${event.venue}\n\nhttps://brujula.digital/eventos/evento/${event.id}`);
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
          <h3 className="font-bold text-base text-white leading-snug line-clamp-2 drop-shadow-sm">
            {event.titulo}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/80">
            {event.fecha && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 shrink-0" />
                {formatDate(event.fecha)}
              </span>
            )}
            {event.venue && (
              <span className="flex items-center gap-1 truncate min-w-0">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </span>
            )}
          </div>
          {event.zona && (
            <p className="text-[10px] text-white/50">
              📍 {event.zona}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const linkHref = href ?? event.source_url;

  if (linkHref) {
    if (linkHref.startsWith("/")) {
      return <Link href={linkHref} className="block">{content}</Link>;
    }
    return (
      <a href={linkHref} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return <div>{content}</div>;
}
