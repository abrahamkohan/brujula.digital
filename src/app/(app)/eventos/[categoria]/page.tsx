"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/eventos/event-card";
import MovieCard from "@/components/eventos/movie-card";
import { SkeletonGrid } from "@/components/eventos/skeleton";
import { GASTRONOMIA, TIPOS_GASTRONOMIA } from "@/lib/directorios/gastronomia";
import { SHOPPING } from "@/lib/directorios/shopping";
import { BARES, TIPOS_BARES } from "@/lib/directorios/bares";
import { HOTELES } from "@/lib/directorios/hoteles";
import { ZONAS, type DirectorioItem } from "@/lib/directorios/types";
import { getZonaFromVenue } from "@/lib/directorios/zonas";

// ─── Tipos ─────────────────────────────────────────────────────

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

interface Pelicula {
  id: string;
  titulo: string;
  duracion_min?: number | null;
  clasificacion?: string | null;
  poster_url?: string | null;
  source_url?: string | null;
}

// ─── Config por categoría ──────────────────────────────────────

const CATEGORY_META: Record<string, { label: string; isDirectorio: boolean; isPeliculas: boolean }> = {
  recitales:    { label: "Recitales", isDirectorio: false, isPeliculas: false },
  deportes:     { label: "Deportes", isDirectorio: false, isPeliculas: false },
  teatro:       { label: "Teatro", isDirectorio: false, isPeliculas: false },
  ferias:       { label: "Ferias", isDirectorio: false, isPeliculas: false },
  cine:         { label: "Cine", isDirectorio: false, isPeliculas: true },
  gastronomia:  { label: "Gastronomía", isDirectorio: true, isPeliculas: false },
  bares:        { label: "Bares", isDirectorio: true, isPeliculas: false },
  shopping:     { label: "Shopping", isDirectorio: true, isPeliculas: false },
  hoteles:      { label: "Hoteles", isDirectorio: true, isPeliculas: false },
};

const CAT_EVENT_MAP: Record<string, string> = {
  recitales: "concierto",
  deportes: "deporte",
  teatro: "teatro",
  ferias: "feria",
};

// ─── Helpers ──────────────────────────────────────────────────

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}
function isToday(d: Date): boolean { return isSameDay(d, new Date()); }
function isTomorrow(d: Date): boolean {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return isSameDay(d, t);
}
function isThisWeekend(d: Date): boolean {
  const hoy = new Date();
  const finde = hoy.getDay() <= 5
    ? new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + (5 - hoy.getDay()))
    : hoy;
  const domingo = new Date(finde);
  domingo.setDate(finde.getDate() + 2);
  return d >= finde && d <= domingo;
}

// ─── Page ──────────────────────────────────────────────────────

export default function CategoriaPage() {
  const params = useParams();
  const categoria = params.categoria as string;
  const meta = CATEGORY_META[categoria];

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zonaFilter, setZonaFilter] = useState("");
  const [tipoGastro, setTipoGastro] = useState("");
  const [tipoBares, setTipoBares] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  // Cargar datos según categoría
  useEffect(() => {
    if (!meta) { setLoading(false); return; }

    if (meta.isPeliculas) {
      createClient()
        .from("peliculas")
        .select("id, titulo, duracion_min, clasificacion, poster_url, source_url")
        .order("fecha_estreno", { ascending: false })
        .then(({ data }) => {
          setPeliculas(data ?? []);
          setLoading(false);
        });
    } else if (!meta.isDirectorio) {
      const catDb = CAT_EVENT_MAP[categoria];
      createClient()
        .from("eventos")
        .select("id, titulo, categoria, fecha, venue, image_url, source_url")
        .eq("categoria", catDb)
        .order("fecha")
        .then(({ data }) => {
          const events = (data ?? []) as Evento[];
          setEventos(events.map((e) => ({ ...e, zona: getZonaFromVenue(e.venue) || "" })));
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [categoria, meta]);

  // ─── Filters ──────────────────────────────

  const searchPredicate = (text: string) => !search || text.toLowerCase().includes(search.toLowerCase());

  const dateFilter = (fecha: string): boolean => {
    if (timeFilter === "all") return true;
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return true;
    if (timeFilter === "hoy") return isToday(d);
    if (timeFilter === "maniana") return isTomorrow(d);
    if (timeFilter === "finde") return isThisWeekend(d);
    return true;
  };

  // Filtrar eventos
  const eventosFiltrados = useMemo(
    () => eventos.filter((e) => searchPredicate(e.titulo) && dateFilter(e.fecha) && (!zonaFilter || e.zona === zonaFilter)),
    [eventos, search, timeFilter, zonaFilter]
  );

  const peliculasFiltradas = peliculas.filter((p) => searchPredicate(p.titulo ?? ""));

  // Directorios
  const gastroFiltrados = GASTRONOMIA.filter(
    (g) => searchPredicate(g.name) && (!zonaFilter || g.zone === zonaFilter) && (!tipoGastro || g.tipo === tipoGastro)
  );
  const baresFiltrados = BARES.filter(
    (b) => searchPredicate(b.name) && (!zonaFilter || b.zone === zonaFilter) && (!tipoBares || b.tipo === tipoBares)
  );
  const shoppingFiltrados = SHOPPING.filter((s) => searchPredicate(s.name) && (!zonaFilter || s.zone === zonaFilter));
  const hotelesFiltrados = HOTELES.filter((h) => searchPredicate(h.name) && (!zonaFilter || h.zone === zonaFilter));

  // Zonas disponibles
  const zonasDisponibles = useMemo(() => {
    const set = new Set<string>();
    if (!meta?.isDirectorio) {
      eventos.forEach((e) => { if (e.zona) set.add(e.zona); });
    }
    if (categoria === "gastronomia") GASTRONOMIA.forEach((g) => set.add(g.zone));
    if (categoria === "bares") BARES.forEach((b) => set.add(b.zone));
    if (categoria === "shopping") SHOPPING.forEach((s) => set.add(s.zone));
    if (categoria === "hoteles") HOTELES.forEach((h) => set.add(h.zone));
    return ZONAS.filter((z) => set.has(z.id));
  }, [eventos, categoria, meta]);

  // ─── Render directorio card ───────────────

  const renderCard = (item: DirectorioItem, extra?: React.ReactNode) => (
    <a
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-full"
    >
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
          {item.badge && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white mb-1">{item.badge}</span>}
          <h3 className="font-semibold text-sm text-white drop-shadow-sm leading-snug">{item.name}</h3>
          <p className="text-xs text-white/80">{ZONAS.find((z) => z.id === item.zone)?.label ?? item.zone}</p>
          <p className="text-xs text-white/80 line-clamp-1">{item.desc}</p>
          {item.horario && <p className="text-[10px] text-white/50">{item.horario}</p>}
          {item.stars && <p className="text-xs text-amber-400">{'★'.repeat(item.stars)}{item.stars < 5 ? '☆'.repeat(5 - item.stars) : ''}</p>}
          {extra}
        </div>
      </div>
    </a>
  );

  // ─── 404 ──────────────────────────────────

  if (!meta) {
    return (
      <div className="min-h-screen bg-[#F5F4ED] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-4xl">🤷</p>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#1F1E1D]">Categoría no encontrada</h1>
          <Link href="/eventos" className="inline-flex items-center gap-1 text-sm text-[#C96442] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Volver a eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ─── Sticky header ──────────────────── */}
      <div className="sticky top-0 z-40 bg-[#F5F4ED]/95 backdrop-blur-sm border-b border-[#D4D2C9]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link href="/eventos" className="flex items-center gap-1.5 text-sm font-medium text-[#5C5B57] hover:text-[#C96442] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <span className="text-[#D4D2C9]">/</span>
          <span className="text-sm font-semibold text-[#1F1E1D]">{meta.label}</span>
        </div>
      </div>

      {/* ─── Contenido ──────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ─── Search + Filters ───────────────── */}
        <div className="space-y-4 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#87867F]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${meta.label.toLowerCase()}...`}
              className="w-full bg-white rounded-xl pl-11 pr-4 py-3 text-sm text-[#1F1E1D] placeholder:text-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442] shadow-sm" />
          </div>

          <div className="space-y-3">
            {/* Time filters — solo eventos */}
            {!meta.isDirectorio && !meta.isPeliculas && (
              <div className="flex gap-2 flex-wrap items-center">
                {(["all", "hoy", "maniana", "finde"] as const).map((qf) => (
                  <button key={qf} onClick={() => setTimeFilter(qf)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      timeFilter === qf ? "bg-[#C96442] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9] hover:border-[#C96442]"
                    }`}>
                    {qf === "all" ? "Todas las fechas" : qf === "hoy" ? "Hoy" : qf === "maniana" ? "Mañana" : "Este finde"}
                  </button>
                ))}
              </div>
            )}

            {/* Zona */}
            {zonasDisponibles.length > 0 && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs font-medium text-[#87867F] shrink-0">Zona</span>
                <button onClick={() => setZonaFilter("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !zonaFilter ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                  }`}>Todas</button>
                {zonasDisponibles.map((z) => (
                  <button key={z.id} onClick={() => setZonaFilter(z.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      zonaFilter === z.id ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                    }`}>{z.label}</button>
                ))}
              </div>
            )}

            {/* Tipo — Gastronomía */}
            {categoria === "gastronomia" && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs font-medium text-[#87867F] shrink-0">Tipo</span>
                <button onClick={() => setTipoGastro("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !tipoGastro ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                  }`}>Todos</button>
                {TIPOS_GASTRONOMIA.map((t) => (
                  <button key={t} onClick={() => setTipoGastro(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      tipoGastro === t ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                    }`}>{t}</button>
                ))}
              </div>
            )}

            {/* Tipo — Bares */}
            {categoria === "bares" && (
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-xs font-medium text-[#87867F] shrink-0">Tipo</span>
                <button onClick={() => setTipoBares("")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    !tipoBares ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                  }`}>Todos</button>
                {TIPOS_BARES.map((t) => (
                  <button key={t} onClick={() => setTipoBares(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      tipoBares === t ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                    }`}>{t}</button>
                ))}
              </div>
            )}

            {/* Limpiar */}
            {(zonaFilter || tipoGastro || tipoBares || timeFilter !== "all") && (
              <div>
                <button onClick={() => { setZonaFilter(""); setTipoGastro(""); setTipoBares(""); setTimeFilter("all"); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1F1E1D] text-white">
                  <X className="h-3 w-3" /> Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Result count ───────────────────── */}
        <p className="text-sm text-[#87867F] mb-6">
          {(() => {
            if (meta.isPeliculas) return `${peliculasFiltradas.length} resultados`;
            if (categoria === "gastronomia") return `${gastroFiltrados.length} resultados`;
            if (categoria === "bares") return `${baresFiltrados.length} resultados`;
            if (categoria === "shopping") return `${shoppingFiltrados.length} resultados`;
            if (categoria === "hoteles") return `${hotelesFiltrados.length} resultados`;
            return `${eventosFiltrados.length} resultados`;
          })()}
        </p>

        {/* ─── Grid ──────────────────────────── */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          <>
            {/* Cine: MovieCard */}
            {meta.isPeliculas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {peliculasFiltradas.map((p) => (
                  <MovieCard key={p.id} movie={p} />
                ))}
                {peliculasFiltradas.length === 0 && (
                  <p className="col-span-full text-sm text-[#87867F] py-12 text-center">No hay resultados</p>
                )}
              </div>
            )}

            {/* Directorios: renderCard */}
            {meta.isDirectorio && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {(categoria === "gastronomia" ? gastroFiltrados :
                  categoria === "bares" ? baresFiltrados :
                  categoria === "shopping" ? shoppingFiltrados :
                  hotelesFiltrados
                ).map((item) => renderCard(
                  item,
                  (categoria === "gastronomia" || categoria === "bares") && item.tipo
                    ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white mt-1">{item.tipo}</span>
                    : undefined
                ))}
                {(categoria === "gastronomia" ? gastroFiltrados :
                  categoria === "bares" ? baresFiltrados :
                  categoria === "shopping" ? shoppingFiltrados :
                  hotelesFiltrados
                ).length === 0 && (
                  <p className="col-span-full text-sm text-[#87867F] py-12 text-center">No hay resultados</p>
                )}
              </div>
            )}

            {/* Eventos: EventCard */}
            {!meta.isDirectorio && !meta.isPeliculas && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {eventosFiltrados.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
                {eventosFiltrados.length === 0 && (
                  <p className="col-span-full text-sm text-[#87867F] py-12 text-center">No hay resultados</p>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── Footer note hoteles ─────────── */}
        {categoria === "hoteles" && (
          <p className="text-xs text-[#87867F] mt-8 text-center">Precios y disponibilidad en Booking.com</p>
        )}
      </div>
    </div>
  );
}
