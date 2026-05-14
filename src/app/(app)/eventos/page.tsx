"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CategoryFilter from "@/components/eventos/category-filter";
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

// ─── Helpers ──────────────────────────────────────────────────

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
  return d >= today && d <= endOfWeek;
}

// ─── Page ──────────────────────────────────────────────────────

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");

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

  // Categorías disponibles (ordenadas como queremos mostrarlas)
  const CAT_ORDER = [
    "concierto",
    "deporte",
    "teatro",
    "feria",
    "entretenimiento",
    "congreso",
  ];
  const categoriasDisponibles = CAT_ORDER.filter((c) =>
    eventos.some((e) => e.categoria?.toLowerCase() === c)
  );

  const filtered =
    filter === "todas"
      ? eventos
      : eventos.filter((e) => e.categoria?.toLowerCase() === filter);

  // Separar por período
  const estaSemana = filtered.filter((e) => isToday(e.fecha) || isThisWeek(e.fecha));
  const proximos = filtered.filter((e) => !isToday(e.fecha) && !isThisWeek(e.fecha));

  // El primero de "esta semana" va como featured (grande)
  const featured = estaSemana.slice(0, 1);
  const restSemana = estaSemana.slice(1, 3); // max 2 más

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ─── Hero ─────────────────────────────────── */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            ¿Qué hay{" "}
            <span className="text-[#C96442] italic">hoy</span>?
          </h1>
          <p className="text-[#B8B7B2] mt-2 sm:mt-3 text-sm sm:text-base max-w-lg">
            Eventos, recitales, ferias, teatro y más en todo Paraguay
          </p>
        </div>
      </div>

      {/* ─── Filtros ──────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-5 mb-8">
        <CategoryFilter
          categories={categoriasDisponibles}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {/* ─── Contenido ────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-12">
        {loading ? (
          <>
            <section>
              <SectionLabel pulse>Esta semana</SectionLabel>
              <SkeletonFeatured />
            </section>
            <section>
              <SectionLabel>Próximos eventos</SectionLabel>
              <SkeletonGrid count={6} />
            </section>
          </>
        ) : (
          <>
            {/* ─── Esta semana ─────────────────── */}
            {estaSemana.length > 0 && (
              <section>
                <SectionLabel pulse>Esta semana</SectionLabel>

                {/* Featured + cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.length > 0 && (
                    <div className="sm:col-span-2">
                      <EventCard event={featured[0]} featured />
                    </div>
                  )}
                  {restSemana.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              </section>
            )}

            {/* ─── Próximos eventos ────────────── */}
            <section>
              <SectionLabel>Próximos eventos</SectionLabel>
              {proximos.length === 0 ? (
                <p className="text-sm text-[#87867F] py-12 text-center">
                  No hay eventos próximos en esta categoría
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {proximos.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </section>

            {/* ─── Footer count ────────────────── */}
            <p className="text-xs text-[#B8B7B2] text-center">
              {filtered.length} evento{filtered.length !== 1 ? "s" : ""}{" "}
              ·{" "}
              <a
                href="/admin/eventos"
                className="underline hover:text-[#C96442] transition-colors"
              >
                Admin
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
