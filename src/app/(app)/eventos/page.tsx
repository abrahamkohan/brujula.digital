"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Search, Music, Trophy, Film, UtensilsCrossed, Hotel, Building2,
  MapPin, Star, Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/eventos/event-card";
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

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(d: Date): string {
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

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

// ─── Nav sections ──────────────────────────────────────────────

const SECTIONS = [
  { id: "recitales", cat: "concierto", icon: Music, label: "Recitales" },
  { id: "deportes", cat: "deporte", icon: Trophy, label: "Deportes" },
  { id: "cine", icon: Film, label: "Cine", esPeliculas: true },
  { id: "teatro", cat: "teatro", icon: Film, label: "Teatro" },
  { id: "ferias", cat: "feria", icon: Building2, label: "Ferias" },
  { id: "gastronomia", icon: UtensilsCrossed, label: "Gastronomía", esDirectorio: true },
  { id: "bares", icon: Clock, label: "Bares", esDirectorio: true }, // Using Clock as placeholder icon
  { id: "shopping", icon: Building2, label: "Shopping", esDirectorio: true },
  { id: "hoteles", icon: Hotel, label: "Hoteles", esDirectorio: true },
];

const QUICK_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "hoy", label: "Hoy" },
  { id: "maniana", label: "Mañana" },
  { id: "finde", label: "Este finde" },
];

// ─── Page ──────────────────────────────────────────────────────

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [zonaFilter, setZonaFilter] = useState("");
  const [tipoGastro, setTipoGastro] = useState("");
  const [tipoBares, setTipoBares] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("recitales");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    Promise.all([
      createClient().from("eventos").select("id, titulo, categoria, fecha, venue, image_url, source_url").order("fecha"),
      createClient().from("peliculas").select("id, titulo, duracion_min, clasificacion, poster_url, source_url").order("fecha_estreno", { ascending: false }),
    ]).then(([er, pr]) => {
      const events = (er.data ?? []) as Evento[];
      setEventos(events.map((e) => ({ ...e, zona: getZonaFromVenue(e.venue) || "" })));
      setPeliculas(pr.data ?? []);
      setLoading(false);
    });
  }, []);

  // Observer
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [loading]);

  const scrollTo = (id: string) => sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });

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

  const zoneFilter = (zona?: string) => !zonaFilter || zona === zonaFilter;

  // Eventos por categoría
  const eventosPorCategoria = useMemo(
    () =>
      SECTIONS.filter((s) => !s.esDirectorio && !s.esPeliculas).map((sec) => ({
        ...sec,
        events: eventos
          .filter((e) => e.categoria === sec.cat && searchPredicate(e.titulo) && dateFilter(e.fecha) && zoneFilter(e.zona))
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),
      })),
    [eventos, search, timeFilter, zonaFilter]
  );

  const peliculasFiltradas = peliculas.filter(
    (p) => searchPredicate(p.titulo ?? "") && (!zonaFilter || zonaFilter === "centro" || zonaFilter === "villa-morra" || zonaFilter === "carmelitas")
  );

  // Directorios
  const filtrarDirectorio = (items: DirectorioItem[]) =>
    items.filter(
      (i) =>
        searchPredicate(i.name) &&
        (!zonaFilter || i.zone === zonaFilter) &&
        (i.tipo === undefined || true)
    );

  const gastroFiltrados = GASTRONOMIA.filter(
    (g) => searchPredicate(g.name) && (!zonaFilter || g.zone === zonaFilter) && (!tipoGastro || g.tipo === tipoGastro)
  );

  const baresFiltrados = BARES.filter(
    (b) => searchPredicate(b.name) && (!zonaFilter || b.zone === zonaFilter) && (!tipoBares || b.tipo === tipoBares)
  );

  const shoppingFiltrados = SHOPPING.filter((s) => searchPredicate(s.name) && (!zonaFilter || s.zone === zonaFilter));
  const hotelesFiltrados = HOTELES.filter((h) => searchPredicate(h.name) && (!zonaFilter || h.zone === zonaFilter));

  // Zonas disponibles (de todos los datos)
  const zonasDisponibles = useMemo(() => {
    const set = new Set<string>();
    eventos.forEach((e) => { if (e.zona) set.add(e.zona); });
    GASTRONOMIA.forEach((g) => set.add(g.zone));
    BARES.forEach((b) => set.add(b.zone));
    SHOPPING.forEach((s) => set.add(s.zone));
    HOTELES.forEach((h) => set.add(h.zone));
    return ZONAS.filter((z) => set.has(z.id));
  }, [eventos]);

  // ─── Render card genérico para directorios ──

  const renderCard = (item: DirectorioItem, extra?: React.ReactNode) => (
    <a
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group w-56 sm:w-64 shrink-0 snap-start"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
          {item.badge && <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white mb-1">{item.badge}</span>}
          <h3 className="font-semibold text-sm text-white drop-shadow-sm leading-snug">{item.name}</h3>
          <p className="text-xs text-white/60">{ZONAS.find((z) => z.id === item.zone)?.label ?? item.zone}</p>
          <p className="text-xs text-white/80 line-clamp-1">{item.desc}</p>
          {item.horario && <p className="text-[10px] text-white/50">{item.horario}</p>}
          {item.stars && <p className="text-xs text-amber-400">{'★'.repeat(item.stars)}{item.stars < 5 ? '☆'.repeat(5 - item.stars) : ''}</p>}
          {extra}
        </div>
      </div>
    </a>
  );

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            ¿Qué hay{" "}
            <span className="text-[#C96442] italic">hoy</span>?
          </h1>
          <p className="text-[#B8B7B2] mt-3 text-sm sm:text-base max-w-lg mx-auto">
            Eventos, recitales, gastronomía, bares y más en Paraguay
          </p>
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#87867F]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos, restaurantes, bares..."
              className="w-full bg-white rounded-2xl pl-14 pr-6 py-4 text-base text-[#1F1E1D] placeholder:text-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442] shadow-sm transition-shadow" />
          </div>
          {/* Quick filters */}
          <div className="flex gap-2 justify-center mt-6 flex-wrap">
            {QUICK_FILTERS.map((qf) => (
              <button key={qf.id} onClick={() => setTimeFilter(qf.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  timeFilter === qf.id ? "bg-[#C96442] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}>{qf.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Sticky nav ────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#F5F4ED]/95 backdrop-blur-sm border-b border-[#D4D2C9]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 space-y-2">
          {/* Sections */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon;
              return (
                <button key={sec.id} onClick={() => scrollTo(sec.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                    activeSection === sec.id ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9] hover:border-[#C96442]"
                  }`}>
                  <Icon className="h-3.5 w-3.5" />{sec.label}
                </button>
              );
            })}
          </div>
          {/* Zone filter */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            <button onClick={() => setZonaFilter("")}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                !zonaFilter ? "bg-[#C96442] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
              }`}>
              📍 Todas
            </button>
            {zonasDisponibles.map((z) => (
              <button key={z.id} onClick={() => setZonaFilter(z.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  zonaFilter === z.id ? "bg-[#C96442] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                }`}>
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Contenido ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-14 pt-8">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <SkeletonGrid key={i} count={4} />)}
          </>
        ) : (
          <>
            {/* ═══ SECCIONES DE EVENTOS ═══════════════ */}
            {eventosPorCategoria.map((sec) => {
              if (sec.events.length === 0) return null;
              const Icon = sec.icon;
              return (
                <section key={sec.id} id={sec.id} ref={(el) => { sectionRefs.current[sec.id] = el; }} className="scroll-mt-28">
                  <SectionHeader icon={<Icon className="h-4 w-4" />} title={sec.label} />
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                    {sec.events.map((e) => (
                      <div key={e.id} className="w-56 sm:w-64 shrink-0 snap-start">
                        <EventCard event={e} />
                        {e.zona && <p className="text-[10px] text-[#87867F] mt-1.5 px-1">{ZONAS.find((z) => z.id === e.zona)?.label}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* ═══ CINE ═════════════════════════════ */}
            {peliculasFiltradas.length > 0 && (
              <section id="cine" ref={(el) => { sectionRefs.current.cine = el; }} className="scroll-mt-28">
                <SectionHeader icon={<Film className="h-4 w-4" />} title="Cine" />
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {peliculasFiltradas.map((p) => (
                    <a key={p.id} href={p.source_url ?? "#"} target="_blank" rel="noopener noreferrer"
                      className="group w-44 sm:w-48 shrink-0 snap-start">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                        {p.poster_url ? (
                          <img src={p.poster_url} alt={p.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-100 flex items-center justify-center">
                            <Film className="h-10 w-10 text-white/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-0.5">
                          <h3 className="font-semibold text-xs text-white leading-snug line-clamp-2 drop-shadow-sm">{p.titulo}</h3>
                          {p.clasificacion && <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">{p.clasificacion}</span>}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ═══ GASTRONOMÍA ═════════════════════ */}
            <section id="gastronomia" ref={(el) => { sectionRefs.current.gastronomia = el; }} className="scroll-mt-28">
              <SectionHeader icon={<UtensilsCrossed className="h-4 w-4" />} title="Gastronomía" />
              {/* Tipo filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
                <button onClick={() => setTipoGastro("")}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    !tipoGastro ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                  }`}>Todos</button>
                {TIPOS_GASTRONOMIA.map((t) => (
                  <button key={t} onClick={() => setTipoGastro(t)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      tipoGastro === t ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                    }`}>{t}</button>
                ))}
              </div>
              {gastroFiltrados.length === 0 ? (
                <p className="text-sm text-[#87867F] py-8 text-center">No hay resultados</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {gastroFiltrados.map((g) => renderCard(g, g.tipo ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white mt-1">{g.tipo}</span> : undefined))}
                </div>
              )}
            </section>

            {/* ═══ BARES ══════════════════════════ */}
            <section id="bares" ref={(el) => { sectionRefs.current.bares = el; }} className="scroll-mt-28">
              <SectionHeader icon={<Clock className="h-4 w-4" />} title="Bares con música" />
              <div className="flex gap-2 overflow-x-auto scrollbar-none mb-4">
                <button onClick={() => setTipoBares("")}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    !tipoBares ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                  }`}>Todos</button>
                {TIPOS_BARES.map((t) => (
                  <button key={t} onClick={() => setTipoBares(t)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                      tipoBares === t ? "bg-[#1F1E1D] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9]"
                    }`}>{t}</button>
                ))}
              </div>
              {baresFiltrados.length === 0 ? (
                <p className="text-sm text-[#87867F] py-8 text-center">No hay resultados</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {baresFiltrados.map((b) => renderCard(b, b.tipo ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white mt-1">{b.tipo}</span> : undefined))}
                </div>
              )}
            </section>

            {/* ═══ SHOPPING ═════════════════════ */}
            <section id="shopping" ref={(el) => { sectionRefs.current.shopping = el; }} className="scroll-mt-28">
              <SectionHeader icon={<Building2 className="h-4 w-4" />} title="Shopping" />
              {shoppingFiltrados.length === 0 ? (
                <p className="text-sm text-[#87867F] py-8 text-center">No hay resultados</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {shoppingFiltrados.map((s) => renderCard(s))}
                </div>
              )}
            </section>

            {/* ═══ HOTELES ═══════════════════════ */}
            <section id="hoteles" ref={(el) => { sectionRefs.current.hoteles = el; }} className="scroll-mt-28">
              <SectionHeader icon={<Hotel className="h-4 w-4" />} title="Hoteles" />
              {hotelesFiltrados.length === 0 ? (
                <p className="text-sm text-[#87867F] py-8 text-center">No hay resultados</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {hotelesFiltrados.map((h) => renderCard(h))}
                </div>
              )}
              <p className="text-xs text-[#87867F] mt-3 text-center">Precios y disponibilidad en Booking.com</p>
            </section>

            {/* Footer */}
            <p className="text-xs text-[#B8B7B2] text-center pt-4">
              {eventos.length} eventos · {GASTRONOMIA.length} restaurantes · {BARES.length} bares · {HOTELES.length} hoteles ·{" "}
              <a href="/admin/eventos" className="underline hover:text-[#C96442] transition-colors">Admin</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section Header component ──────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg bg-[#1F1E1D] flex items-center justify-center text-white">{icon}</div>
      <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-[#D4D2C9]/50" />
    </div>
  );
}
