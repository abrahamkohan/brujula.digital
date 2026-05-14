"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Music, UtensilsCrossed, Hotel, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/eventos/event-card";
import SectionLabel from "@/components/eventos/section-label";
import { SkeletonGrid, SkeletonFeatured } from "@/components/eventos/skeleton";

// ─── Tipos ─────────────────────────────────────────────────────

interface Evento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  venue: string;
  image_url?: string | null;
  source_url?: string | null;
}

interface Lugar {
  name: string;
  zone: string;
  desc: string;
  image: string;
  url: string;
  stars?: number;
  badge?: string;
}

// ─── Datos hardcodeados ────────────────────────────────────────

const GASTRONOMIA: Lugar[] = [
  { name: "La Paraguayita", zone: "Villa Morra", desc: "Cocina tradicional paraguaya", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=La+Paraguayita+Asuncion" },
  { name: "Bolsi", zone: "Centro", desc: "Histórico, clásico de Asunción", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=Bolsi+Asuncion" },
  { name: "Tierra Colorada", zone: "Carmelitas", desc: "Cocina de autor con identidad local", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=Tierra+Colorada+Asuncion" },
  { name: "Casa Brizuela", zone: "Villa Morra", desc: "Gastronomía de autor", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=Casa+Brizuela+Asuncion" },
  { name: "Nuevamente Café", zone: "Las Mercedes", desc: "Café y brunch de especialidad", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=Nuevamente+Cafe+Asuncion" },
  { name: "Lido Bar", zone: "Centro", desc: "Tradicional, emblema de Asunción", image: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=500&fit=crop", url: "https://maps.google.com/?q=Lido+Bar+Asuncion" },
];

const HOTELES: Lugar[] = [
  { name: "Sheraton Asunción", zone: "Carmelitas", desc: "Hotel 5 estrellas", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=500&fit=crop", url: "https://www.booking.com/search.html?ss=Sheraton+Asuncion", stars: 5, badge: "Recomendado" },
  { name: "Esplendor by Wyndham", zone: "Villa Morra", desc: "Hotel 4 estrellas", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=500&fit=crop", url: "https://www.booking.com/search.html?ss=Esplendor+Asuncion", stars: 4 },
  { name: "Dazzler Asunción", zone: "Villa Morra", desc: "Hotel 4 estrellas", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=500&fit=crop", url: "https://www.booking.com/search.html?ss=Dazzler+Asuncion", stars: 4 },
  { name: "NH Asunción", zone: "Centro", desc: "Hotel 4 estrellas", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=500&fit=crop", url: "https://www.booking.com/search.html?ss=NH+Asuncion", stars: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() + (7 - today.getDay()));
  return d >= today && d <= end;
}

// ─── Nav pills ─────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "eventos", label: "Eventos", icon: Music },
  { id: "gastronomia", label: "Gastronomía", icon: UtensilsCrossed },
  { id: "hoteles", label: "Hoteles", icon: Hotel },
];

// ─── Page ──────────────────────────────────────────────────────

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("eventos");

  const sectionRefs = {
    eventos: useRef<HTMLElement>(null),
    gastronomia: useRef<HTMLElement>(null),
    hoteles: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    createClient()
      .from("eventos")
      .select("id, titulo, categoria, fecha, venue, image_url, source_url")
      .order("fecha", { ascending: true })
      .then(({ data }) => {
        setEventos(data ?? []);
        setLoading(false);
      });
  }, []);

  // Observer para sticky nav active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -50% 0px" }
    );

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [loading]);

  const scrollTo = (id: string) => {
    sectionRefs[id as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const searchFilter = (e: Evento) =>
    !search || e.titulo?.toLowerCase().includes(search.toLowerCase());

  const estaSemana = eventos.filter((e) => (isToday(e.fecha) || isThisWeek(e.fecha)) && searchFilter(e));
  const proximos = eventos.filter((e) => !isToday(e.fecha) && !isThisWeek(e.fecha) && searchFilter(e));
  const featured = estaSemana.slice(0, 1);
  const restSemana = estaSemana.slice(1, 3);

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            ¿Qué hay{" "}
            <span className="text-[#C96442] italic">hoy</span>?
          </h1>
          <p className="text-[#B8B7B2] mt-3 text-sm sm:text-base">
            Eventos, recitales, ferias, teatro, gastronomía y más en Paraguay
          </p>

          {/* Buscador unificado */}
          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#87867F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos, restaurantes, hoteles..."
              className="w-full bg-white rounded-2xl pl-14 pr-6 py-4 text-base text-[#1F1E1D] placeholder:text-[#87867F] focus:outline-none focus:ring-2 focus:ring-[#C96442] shadow-sm transition-shadow"
            />
          </div>
        </div>
      </div>

      {/* ─── Sticky nav pills ──────────────────────── */}
      <div className="sticky top-0 z-40 bg-[#F5F4ED]/95 backdrop-blur-sm border-b border-[#D4D2C9]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
                  activeSection === item.id
                    ? "bg-[#1F1E1D] text-white shadow-sm"
                    : "bg-white text-[#5C5B57] border border-[#D4D2C9] hover:border-[#C96442]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Contenido ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-16">
        {/* ═══ EVENTOS ════════════════════════════════ */}
        <section id="eventos" ref={sectionRefs.eventos} className="scroll-mt-24">
          {loading ? (
            <>
              <SectionLabel pulse>Esta semana</SectionLabel>
              <SkeletonFeatured />
              <div className="mt-12">
                <SectionLabel>Próximos eventos</SectionLabel>
                <SkeletonGrid count={6} />
              </div>
            </>
          ) : (
            <>
              {estaSemana.length > 0 && (
                <div className="mb-12">
                  <SectionLabel pulse>Esta semana</SectionLabel>
                  {/* Desktop: grid | Mobile: scroll horizontal */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.length > 0 && (
                      <div className="sm:col-span-2">
                        <EventCard event={featured[0]} featured />
                      </div>
                    )}
                    {restSemana.map((e) => (
                      <EventCard key={e.id} event={e} />
                    ))}
                  </div>
                  <div className="flex sm:hidden gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
                    {estaSemana.slice(0, 5).map((e) => (
                      <div key={e.id} className="w-64 shrink-0 snap-start">
                        <EventCard event={e} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <SectionLabel>Próximos eventos</SectionLabel>
              {proximos.length === 0 ? (
                <p className="text-sm text-[#87867F] py-12 text-center">
                  {search ? "No hay resultados" : "No hay eventos próximos"}
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proximos.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* ═══ GASTRONOMÍA ════════════════════════════ */}
        <section id="gastronomia" ref={sectionRefs.gastronomia} className="scroll-mt-24">
          <SectionLabel>Dónde comer</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {GASTRONOMIA.map((l) => (
              <a
                key={l.name}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    <h3 className="font-semibold text-sm text-white drop-shadow-sm">{l.name}</h3>
                    <p className="text-xs text-white/60">{l.zone}</p>
                    <p className="text-xs text-white/80">{l.desc}</p>
                  </div>
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-white/20 backdrop-blur-sm text-white">
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ═══ HOTELES ═══════════════════════════════ */}
        <section id="hoteles" ref={sectionRefs.hoteles} className="scroll-mt-24">
          <SectionLabel>Dónde quedarse</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {HOTELES.map((h) => (
              <a
                key={h.name}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={h.image}
                    alt={h.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1">
                    {h.badge && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white mb-1">
                        {h.badge}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-white drop-shadow-sm">{h.name}</h3>
                    <p className="text-xs text-white/60">{h.zone}</p>
                    {h.stars && (
                      <p className="text-xs text-amber-400">{'★'.repeat(h.stars)}</p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p className="text-xs text-[#87867F] mt-3 text-center">
            Precios y disponibilidad en Booking.com
          </p>
        </section>

        {/* Footer */}
        <p className="text-xs text-[#B8B7B2] text-center">
          {eventos.length} eventos en cartelera ·{" "}
          <a href="/admin/eventos" className="underline hover:text-[#C96442] transition-colors">
            Admin
          </a>
        </p>
      </div>
    </div>
  );
}
