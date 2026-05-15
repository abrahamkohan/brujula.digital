"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  Search, Music, Trophy, Film, Building2, X,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/eventos/event-card";
import MovieCard from "@/components/eventos/movie-card";
import { SkeletonGrid } from "@/components/eventos/skeleton";
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
  editorial_pick?: boolean;
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
  { id: "todos", icon: Search, label: "Todos" },
  { id: "recitales", cat: "concierto", icon: Music, label: "Recitales" },
  { id: "deportes", cat: "deporte", icon: Trophy, label: "Deportes" },
  { id: "cine", icon: Film, label: "Cine", esPeliculas: true },
  { id: "teatro", cat: "teatro", icon: Film, label: "Teatro" },
  { id: "ferias", cat: "feria", icon: Building2, label: "Ferias" },
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
  const [timeFilter, setTimeFilter] = useState("all");
  const [activeSection, setActiveSection] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Fecha filter: solo eventos con año entre 2024 y 2028
  const eventosValidos = useMemo(
    () => eventos.filter((e) => {
      const year = new Date(e.fecha).getFullYear();
      return year >= 2024 && year <= 2028;
    }),
    [eventos]
  );

  useEffect(() => {
    Promise.all([
      createClient().from("eventos").select("id, titulo, categoria, fecha, venue, image_url, source_url, editorial_pick").order("fecha"),
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
    const sentinel = document.getElementById("top-sentinel");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id === "top-sentinel" ? "todos" : e.target.id);
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    if (sentinel) obs.observe(sentinel);
    SECTIONS.forEach(({ id }) => { const el = sectionRefs.current[id]; if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [loading]);

  const scrollTo = (id: string) => {
    if (id === "todos") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  // Editorial picks — sin filtros de usuario, siempre se muestran
  const eventosPick = useMemo(
    () => eventosValidos.filter((e) => e.editorial_pick),
    [eventosValidos]
  );

  // Eventos por categoría
  const eventosPorCategoria = useMemo(
    () =>
      SECTIONS.filter((s) => !s.esPeliculas).map((sec) => ({
        ...sec,
        events: eventosValidos
          .filter((e) => e.categoria === sec.cat && searchPredicate(e.titulo) && dateFilter(e.fecha))
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()),
      })),
    [eventosValidos, search, timeFilter]
  );

  const peliculasFiltradas = peliculas.filter(
    (p) => searchPredicate(p.titulo ?? "")
  );

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            ¿Qué hay{" "}
            <span className="text-[#C96442] italic">hoy</span>?
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base max-w-lg mx-auto">
            Eventos en Paraguay — recitales, teatro, deportes y más
          </p>
          <p className="text-[#87867F] mt-1 text-xs sm:text-sm">
            {eventosValidos.length} eventos · actualizado hoy
          </p>
          <div className="relative max-w-2xl mx-auto mt-5">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#87867F]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscá eventos..."
              className="w-full bg-white rounded-2xl pl-14 pr-6 py-3.5 text-sm text-[#1F1E1D] placeholder:text-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442] shadow-sm transition-shadow" />
          </div>
          {/* Quick filters */}
          <div className="flex gap-2 justify-center mt-4 flex-wrap">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex gap-2 flex-wrap">
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
        </div>
      </div>

      {/* ─── Contenido ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-14 pt-8">
        <div id="top-sentinel" className="-mt-8 h-1" />
        {loading ? (
          <>
            {[1, 2, 3].map((i) => <SkeletonGrid key={i} count={4} />)}
          </>
        ) : (
          <>
            {/* ═══ SELECCIÓN BRÚJULA ══════════════════ */}
            {eventosPick.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#C96442] text-white">★ Selección Brújula</span>
                  <div className="flex-1 h-px bg-[#D4D2C9]/50" />
                </div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1F1E1D] tracking-tight mb-4">
                  Lo que vale la pena
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {eventosPick.slice(0, 3).map((e) => (
                    <EventCard key={e.id} event={e} featured href={`/eventos/evento/${e.id}`} />
                  ))}
                </div>
              </section>
            )}

            {/* ═══ SECCIONES DE EVENTOS ═══════════════ */}
            {eventosPorCategoria.map((sec) => {
              const Icon = sec.icon;
              const hasEvents = sec.events.length > 0;
              const visible = sec.events.slice(0, 5);
              return (
                <section key={sec.id} id={sec.id} ref={(el) => { sectionRefs.current[sec.id] = el; }} className="scroll-mt-28">
                  {hasEvents ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#1F1E1D] flex items-center justify-center text-white">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
                          {sec.label}
                        </h2>
                        <div className="flex-1 h-px bg-[#D4D2C9]/50" />
                        {sec.events.length > 5 && (
                          <Link href={`/eventos/${sec.id}`}
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-[#5C5B57] border border-[#D4D2C9] hover:border-[#C96442] hover:text-[#C96442] transition-all whitespace-nowrap">
                            Ver todos ({sec.events.length}) →
                          </Link>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {visible.map((e) => (
                          <EventCard key={e.id} event={e} />
                        ))}
                      </div>
                    </>
                  ) : null}
                </section>
              );
            })}

            {/* ═══ CINE ═════════════════════════════ */}
            {peliculasFiltradas.length > 0 && (
              <section id="cine" ref={(el) => { sectionRefs.current.cine = el; }} className="scroll-mt-28">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1F1E1D] flex items-center justify-center text-white">
                    <Film className="h-4 w-4" />
                  </div>
                  <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">Cine</h2>
                  <div className="flex-1 h-px bg-[#D4D2C9]/50" />
                  {peliculasFiltradas.length > 5 && (
                    <Link href="/eventos/cine"
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white text-[#5C5B57] border border-[#D4D2C9] hover:border-[#C96442] hover:text-[#C96442] transition-all whitespace-nowrap">
                      Ver todas ({peliculasFiltradas.length}) →
                    </Link>
                  )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                  {peliculasFiltradas.slice(0, 5).map((p) => (
                    <div key={p.id} className="w-44 sm:w-52 shrink-0 snap-start">
                      <MovieCard movie={p} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <p className="text-xs text-[#B8B7B2] text-center pt-4">
              {eventosValidos.length} eventos ·{" "}
              <Link href="/guia" className="underline hover:text-[#C96442] transition-colors">Guía de Asunción</Link>
              {" · "}
              <a href="/admin/eventos" className="underline hover:text-[#C96442] transition-colors">Admin</a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
