"use client";

import { Calendar, MapPin, Music, Trophy, Building2, Users, Sparkles, Film, Clapperboard } from "lucide-react";

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
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const currentYear = new Date().getFullYear();
  return `${day} ${month}${year !== currentYear ? ` ${year}` : ""}`;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

export default function EventCard({ event, featured }: Props) {
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

        {hoy && (
          <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C96442] text-white shadow-xs animate-pulse">
            Hoy
          </span>
        )}

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

  if (event.source_url) {
    return (
      <a key={event.id} href={event.source_url} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return <div key={event.id}>{content}</div>;
}
