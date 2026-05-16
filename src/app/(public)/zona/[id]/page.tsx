import { createClient } from "@/lib/supabase/server";
import { ZONAS } from "@/lib/directorios/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, UtensilsCrossed, Beer, Hotel, Film,
  Landmark, TreePine, Building2, Trophy, MicVocal,
  TreePalm, BookOpen, Compass,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";
import { ShareButton } from "@/components/share-button";
import { getZonaHero, getZonaDesc } from "@/lib/zonas-images";
import { ImageWithFallback } from "@/components/image-fallback";
import { KohanCtaCompact } from "@/components/kohan-cta-compact";

// ─── Tipos ─────────────────────────────────────────────────────

interface DirectorioDB {
  id: string;
  tipo: string;
  name: string;
  descripcion: string;
  zone: string;
  image: string;
  url: string;
  tipo_lugar: string | null;
  horario: string | null;
  badge: string | null;
  stars: number | null;
  direccion: string | null;
  featured: boolean;
}

// ─── Mapa de iconos y labels ──────────────────────────────────

const TIPO_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
  shopping: { icon: ShoppingBag, label: "Shoppings" },
  gastronomia: { icon: UtensilsCrossed, label: "Restaurantes" },
  bar: { icon: Beer, label: "Bares" },
  hotel: { icon: Hotel, label: "Hoteles" },
  teatro: { icon: Film, label: "Teatros" },
  museo: { icon: Landmark, label: "Museos" },
  parque: { icon: TreePine, label: "Parques" },
  edificio: { icon: Building2, label: "Edificios históricos" },
  estadio: { icon: Trophy, label: "Estadios" },
  venue: { icon: MicVocal, label: "Espacios para eventos" },
  "centro-cultural": { icon: TreePalm, label: "Centros culturales" },
  libreria: { icon: BookOpen, label: "Librerías" },
};

// ─── Static params ────────────────────────────────────────────

export async function generateStaticParams() {
  return ZONAS.map((z) => ({ id: z.id }));
}

// ─── Metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const zona = ZONAS.find((z) => z.id === id);
  if (!zona) return { title: "Zona no encontrada — Brújula Digital" };

  return {
    title: `${zona.label} — Guía de Asunción | Brújula Digital`,
    description: `Descubrí todo lo que hay en ${zona.label}: shoppings, restaurantes, bares, museos, hoteles y más. Guía completa de ${zona.label}, Asunción.`,
    openGraph: {
      title: `${zona.label} — Guía de Asunción`,
      description: `Todo lo que necesitás saber sobre ${zona.label}: lugares, actividades y servicios.`,
      locale: "es_PY",
    },
  };
}

// ─── Server Component ─────────────────────────────────────────

export default async function ZonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const zona = ZONAS.find((z) => z.id === id);
  if (!zona) notFound();

  const supabase = await createClient();

  // Fetch todos los lugares activos en esta zona
  const { data: lugares } = await supabase
    .from("directorios")
    .select("*")
    .eq("zone", id)
    .eq("active", true)
    .order("sort_order")
    .order("name");

  const totalLugares = lugares?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* ─── Hero con imagen ──────────────────────── */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        {(() => {
          const hero = getZonaHero(id);
          return hero ? (
            <img src={hero} alt={zona.label} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1D] to-[#2A2825]" />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-4 sm:px-6 pb-6 sm:pb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-[#87867F] text-sm hover:text-white transition-colors mb-2">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Volver al inicio
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            {zona.label}
          </h1>
          <p className="text-[#B8B7B2] mt-1 text-sm sm:text-base max-w-xl">
            {getZonaDesc(id) ?? ""}{getZonaDesc(id) ? " · " : ""}{totalLugares} lugares
          </p>
        </div>
      </div>

      {/* ─── Contenido ────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        {!lugares || lugares.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-[#1F1E1D] font-semibold text-lg">Estamos mapeando {zona.label}</p>
            <p className="text-[#87867F] text-sm max-w-xs mx-auto">
              Pronto vas a encontrar restaurantes, bares y lugares destacados de {zona.label} acá.
            </p>
            <Link href="/guia" className="inline-block text-sm text-[#C96442] hover:underline mt-2">
              Explorá otras zonas →
            </Link>
          </div>
        ) : (() => {
          const grouped = lugares.reduce<Record<string, DirectorioDB[]>>((acc, lugar) => {
            if (!acc[lugar.tipo]) acc[lugar.tipo] = [];
            acc[lugar.tipo].push(lugar);
            return acc;
          }, {});
          const sortedTipos = Object.entries(grouped)
            .filter(([tipo]) => TIPO_CONFIG[tipo])
            .sort(([, a], [, b]) => b.length - a.length);
          return sortedTipos.map(([tipo, items]) => {
          const config = TIPO_CONFIG[tipo];
          if (!config) return null;
          const Icon = config.icon;

          return (
            <section key={tipo}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#1F1E1D] flex items-center justify-center text-white">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
                  {config.label}
                </h2>
                <span className="text-sm text-[#87867F]">({items.length})</span>
                <div className="flex-1 h-px bg-[#D4D2C9]/50" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C96442]/30 transition-all duration-300"
                  >
                    <div className="aspect-[16/9] bg-[#F5F4ED] overflow-hidden relative">
                      {item.image ? (
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          fallback={
                            <div className="w-full h-full bg-[#1F1E1D] flex items-center justify-center">
                              <Icon className="h-10 w-10 text-white/20" />
                            </div>
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1F1E1D] flex items-center justify-center">
                          <Icon className="h-10 w-10 text-white/20" />
                        </div>
                      )}
                      {item.featured && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white">
                          ★ Destacado
                        </span>
                      )}
                      {item.badge && (
                        <span className="absolute top-2 right-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white backdrop-blur-sm">
                          {item.badge}
                        </span>
                      )}
                      <ShareButton name={item.name} descripcion={item.descripcion} url={item.url} />
                    </div>
                    <div className="p-4 space-y-1.5">
                      <h3 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">
                        {item.name}
                      </h3>
                      {item.tipo_lugar && (
                        <p className="text-xs text-[#87867F]">{item.tipo_lugar}</p>
                      )}
                      <p className="text-xs text-[#5C5B57] line-clamp-1">{item.descripcion}</p>
                      {item.horario && (
                        <p className="text-xs text-[#87867F]">🕐 {item.horario}</p>
                      )}
                      {item.direccion && (
                        <p className="text-xs text-[#87867F]">📍 {item.direccion}</p>
                      )}
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
          });
        })()}

        {/* ═══════════════════════════════════════════
             🏠 PROPIEDADES EN [ZONA] — LEAD GEN
           ═══════════════════════════════════════════ */}
        <KohanCtaCompact zona={zona.label} />

        {/* ─── Footer ── */}
        <div className="flex flex-wrap gap-4 justify-center pt-4 text-sm text-[#87867F]">
          <Link href="/eventos" className="hover:text-[#C96442] transition-colors">🎪 Eventos</Link>
          <Link href="/guia" className="hover:text-[#C96442] transition-colors">📖 Guía de Asunción</Link>
          <a href="/admin" className="hover:text-[#C96442] transition-colors">⚙️ Admin</a>
        </div>
      </div>
    </div>
  );
}
