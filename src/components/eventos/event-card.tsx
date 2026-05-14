"use client";

import { Calendar, MapPin, Music, Trophy, Building2, Users, Sparkles, Film } from "lucide-react";

interface Evento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  venue: string;
  image_url?: string | null;
  source_url?: string | null;
}

interface Props {
  event: Evento;
  featured?: boolean;
}

const CAT_META: Record<string, { icon: typeof Music; label: string }> = {
  concierto:        { icon: Music,     label: "Concierto" },
  deporte:          { icon: Trophy,    label: "Deporte" },
  teatro:           { icon: Film,      label: "Teatro" },
  feria:            { icon: Building2, label: "Feria" },
  entretenimiento:  { icon: Sparkles,  label: "Entretenimiento" },
  congreso:         { icon: Users,     label: "Congreso" },
};

const GRADIENTS: Record<string, string> = {
  concierto:        "from-purple-200 to-pink-100",
  deporte:          "from-emerald-200 to-teal-100",
  teatro:           "from-violet-200 to-fuchsia-100",
  feria:            "from-amber-200 to-orange-100",
  entretenimiento:  "from-rose-200 to-red-100",
  congreso:         "from-blue-200 to-indigo-100",
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const today = new Date();
  return `${day} ${month}${year !== today.getFullYear() ? ` ${year}` : ""}`;
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export default function EventCard({ event, featured }: Props) {
  const cat = CAT_META[event.categoria?.toLowerCase()] ?? {
    icon: Calendar,
    label: "Evento",
  };
  const Icon = cat.icon;
  const grad = GRADIENTS[event.categoria?.toLowerCase()] ?? "from-gray-200 to-gray-100";
  const hoy = isToday(event.fecha);
  const hasImage = event.image_url?.startsWith("http");

  const content = (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden border border-[#E5E4DD] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        featured ? "" : ""
      }`}
    >
      {/* ─── Imagen / Fallback ───────────────────── */}
      <div className={`relative overflow-hidden ${featured ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
        {hasImage ? (
          <img
            src={event.image_url!}
            alt={event.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(ev) => {
              const el = ev.target as HTMLImageElement;
              el.style.display = "none";
              el.parentElement!.classList.add(
                "flex",
                "items-center",
                "justify-center",
                `bg-gradient-to-br`,
                grad
              );
            }}
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center`}
          >
            <Icon className="h-12 w-12 text-[#B8B7B2]" strokeWidth={1.2} />
          </div>
        )}

        {/* ─── Chip categoría ──────────────────────── */}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide bg-white/85 backdrop-blur-sm text-[#5C5B57] shadow-xs">
          <Icon className="h-3 w-3" />
          {cat.label}
        </span>

        {/* ─── Badge HOY ──────────────────────────── */}
        {hoy && (
          <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#C96442] text-white shadow-xs animate-pulse">
            Hoy
          </span>
        )}
      </div>

      {/* ─── Info ──────────────────────────────────── */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-semibold text-sm text-[#1F1E1D] leading-snug line-clamp-1">
          {event.titulo}
        </h3>
        {event.fecha && (
          <p className="flex items-center gap-1.5 text-xs text-[#5C5B57]">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(event.fecha)}
          </p>
        )}
        {event.venue && (
          <p className="flex items-center gap-1.5 text-xs text-[#87867F]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}
      </div>

      {/* ─── Hover ring ──────────────────────────── */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/0 group-hover:ring-[#C96442]/15 transition-all pointer-events-none" />
    </div>
  );

  if (event.source_url) {
    return (
      <a
        key={event.id}
        href={event.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return <div key={event.id}>{content}</div>;
}
