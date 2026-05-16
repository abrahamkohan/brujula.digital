import { createClient } from "@/lib/supabase/server";
import { ZONAS } from "@/lib/directorios/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import type { Metadata } from "next";

// ─── Tipos válidos ────────────────────────────────────────────

const TIPOS_VALIDOS = [
  "shopping", "gastronomia", "bar", "hotel", "teatro",
  "museo", "parque", "edificio", "estadio", "venue",
  "centro-cultural", "libreria", "complejo",
] as const;

type TipoValido = (typeof TIPOS_VALIDOS)[number];

const TIPO_LABELS: Record<TipoValido, { singular: string; plural: string }> = {
  shopping: { singular: "Shopping", plural: "Shoppings" },
  gastronomia: { singular: "Restaurante", plural: "Restaurantes" },
  bar: { singular: "Bar", plural: "Bares" },
  hotel: { singular: "Hotel", plural: "Hoteles" },
  teatro: { singular: "Teatro", plural: "Teatros" },
  museo: { singular: "Museo", plural: "Museos" },
  parque: { singular: "Parque", plural: "Parques" },
  edificio: { singular: "Edificio", plural: "Edificios históricos" },
  estadio: { singular: "Estadio", plural: "Estadios" },
  venue: { singular: "Espacio", plural: "Espacios para eventos" },
  "centro-cultural": { singular: "Centro cultural", plural: "Centros culturales" },
  libreria: { singular: "Librería", plural: "Librerías" },
  complejo: { singular: "Complejo", plural: "Escapadas" },
};

function isTipo(v: string): v is TipoValido {
  return TIPOS_VALIDOS.includes(v as TipoValido);
}

// ─── Static params ────────────────────────────────────────────

export async function generateStaticParams() {
  return TIPOS_VALIDOS.map((tipo) => ({ tipo }));
}

// ─── Metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
  const { tipo } = await params;
  if (!isTipo(tipo)) return { title: "No encontrado — Brújula Digital" };
  const label = TIPO_LABELS[tipo].plural;
  return {
    title: `${label} en Asunción — Guía completa | Brújula Digital`,
    description: `Descubrí los mejores ${label.toLowerCase()} en Asunción. Direcciones, horarios, zonas y más. Guía actualizada de ${label.toLowerCase()} en Asunción.`,
  };
}

// ═══════════════════════════════════════════════════════════════

export default async function CategoriaGuiaPage({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  if (!isTipo(tipo)) notFound();

  const label = TIPO_LABELS[tipo];
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("directorios")
    .select("*")
    .eq("tipo", tipo)
    .eq("active", true)
    .order("sort_order")
    .order("name");

  const lugares = items ?? [];

  // Agrupar por zona
  const grouped: Record<string, typeof lugares> = {};
  lugares.forEach((l) => {
    if (!grouped[l.zone]) grouped[l.zone] = [];
    grouped[l.zone].push(l);
  });

  const zonasConData = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <Link href="/guia" className="inline-flex items-center gap-1 text-[#87867F] text-sm hover:text-white transition-colors mb-4">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Guía
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            {label.plural} en Asunción
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base">
            {lugares.length} {lugares.length === 1 ? label.singular.toLowerCase() : label.plural.toLowerCase()}{" "}
            · Guía actualizada
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {lugares.length === 0 ? (
          <p className="text-center text-[#87867F] py-12">Todavía no hay {label.plural.toLowerCase()} registrados.</p>
        ) : (
          <>
            {/* Filtro rápido por zona */}
            <div className="flex flex-wrap gap-2 mb-8">
              {zonasConData.map((zonaId) => {
                const zona = ZONAS.find((z) => z.id === zonaId);
                return (
                  <a
                    key={zonaId}
                    href={`#zona-${zonaId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#D4D2C9] text-xs text-[#5C5B57] hover:border-[#C96442] hover:text-[#C96442] transition-all"
                  >
                    📍 {zona?.label ?? zonaId} ({grouped[zonaId].length})
                  </a>
                );
              })}
            </div>

            {/* Listado por zona */}
            <div className="space-y-10">
              {zonasConData.map((zonaId) => {
                const zona = ZONAS.find((z) => z.id === zonaId);
                const items = grouped[zonaId];
                return (
                  <section key={zonaId} id={`zona-${zonaId}`} className="scroll-mt-20">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1F1E1D]">
                        📍 {zona?.label ?? zonaId}
                      </h2>
                      <span className="text-sm text-[#87867F]">({items.length})</span>
                      <div className="flex-1 h-px bg-[#D4D2C9]/50" />
                      <Link href={`/zona/${zonaId}`} className="text-xs text-[#C96442] hover:underline shrink-0">
                        Ver zona completa →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {items.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C96442]/30 transition-all"
                        >
                          <div className="aspect-[16/9] bg-[#F5F4ED] overflow-hidden relative">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-[#1F1E1D]" />
                            )}
                            {item.featured && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white">★ Destacado</span>
                            )}
                            {item.badge && (
                              <span className="absolute top-2 right-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white backdrop-blur-sm">{item.badge}</span>
                            )}
                            <ShareButton name={item.name} descripcion={item.descripcion} url={item.url} />
                          </div>
                          <div className="p-4 space-y-1.5">
                            <h3 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{item.name}</h3>
                            {item.tipo_lugar && <p className="text-xs text-[#87867F]">{item.tipo_lugar}</p>}
                            <p className="text-xs text-[#5C5B57] line-clamp-1">{item.descripcion}</p>
                            {item.horario && <p className="text-xs text-[#87867F]">🕐 {item.horario}</p>}
                            {item.direccion && <p className="text-xs text-[#87867F]">📍 {item.direccion}</p>}
                            {item.stars && (
                              <p className="text-xs text-amber-400">
                                {"★".repeat(item.stars)}{item.stars < 5 ? "☆".repeat(5 - item.stars) : ""}
                              </p>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
