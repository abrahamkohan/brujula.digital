import { createClient } from "@/lib/supabase/server";
import { ZONAS } from "@/lib/directorios/types";
import { getZonaHero, getZonaDesc } from "@/lib/zonas-images";
import Link from "next/link";
import { Compass, ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import EventCard from "@/components/eventos/event-card";
import { SearchBar } from "@/components/search-bar";
import { KohanCtaCompact } from "@/components/kohan-cta-compact";

// ─── Config ────────────────────────────────────────────────────
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595976227373";

// ─── Metadata ─────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Brújula Digital — Guía de Asunción",
  description:
    "La guía más completa de Asunción: shoppings, museos, restaurantes, bares, hoteles, teatros, parques y más. Encontrá qué hacer, dónde ir y qué comer en Asunción.",
  openGraph: {
    title: "Brújula Digital — Guía de Asunción",
    description: "Encontrá qué hacer, dónde ir y qué comer en Asunción. Guía completa con +130 lugares.",
    locale: "es_PY",
    siteName: "Brújula Digital",
  },
};

// ─── Gradientes de fallback por tipo ──────────────────────────

const TIPO_COVER: Record<string, string> = {
  museo: "https://visitparaguay.travel/storage/places/1046-1.webp",
  parque: "https://visitparaguay.travel/storage/places/2187-1.webp",
  edificio: "https://visitparaguay.travel/storage/places/67ee99c03fe63.webp",
  estadio: "https://upload.wikimedia.org/wikipedia/commons/9/93/Estadio_Defensores_del_Chaco_en_2019.jpg",
  venue: "https://visitparaguay.travel/storage/places/680bf456d2436.webp",
  "centro-cultural": "https://upload.wikimedia.org/wikipedia/commons/0/03/Entrada_Principal_Manzana_de_la_Rivera.jpg",
  libreria: "https://visitparaguay.travel/storage/places/630cc4ff52825_1661781247.jpg",
};

const GRADIENTS: Record<string, string> = {
  shopping: "linear-gradient(135deg, #e11d48, #f43f5e)",
  gastronomia: "linear-gradient(135deg, #ea580c, #f97316)",
  bar: "linear-gradient(135deg, #d97706, #f59e0b)",
  hotel: "linear-gradient(135deg, #2563eb, #3b82f6)",
  teatro: "linear-gradient(135deg, #7c3aed, #a855f7)",
  museo: "linear-gradient(135deg, #059669, #10b981)",
  parque: "linear-gradient(135deg, #16a34a, #22c55e)",
  edificio: "linear-gradient(135deg, #57534e, #78716c)",
  estadio: "linear-gradient(135deg, #ca8a04, #eab308)",
  venue: "linear-gradient(135deg, #4f46e5, #6366f1)",
  "centro-cultural": "linear-gradient(135deg, #0d9488, #14b8a6)",
  libreria: "linear-gradient(135deg, #0891b2, #06b6d4)",
};

const TIPO_LABELS: Record<string, string> = {
  shopping: "Shoppings",
  gastronomia: "Restaurantes",
  bar: "Bares",
  hotel: "Hoteles",
  teatro: "Teatros",
  museo: "Museos",
  parque: "Parques",
  edificio: "Edificios históricos",
  estadio: "Estadios",
  venue: "Espacios para eventos",
  "centro-cultural": "Centros culturales",
  libreria: "Librerías",
};

const TIPO_ORDER = [
  "shopping", "museo", "gastronomia", "bar", "hotel", "teatro",
  "parque", "edificio", "estadio", "venue", "centro-cultural", "libreria",
];

// ═══════════════════════════════════════════════════════════════

export default async function HomePage() {
  const supabase = await createClient();

  const [directoriosRes, eventosRes, itinerariosRes] = await Promise.all([
    supabase.from("directorios").select("tipo, name, zone, featured, badge, image, descripcion, horario, stars, url, id").eq("active", true),
    supabase.from("eventos").select("id, titulo, fecha, venue, categoria, image_url, source_url").gte("fecha", new Date().toISOString().split("T")[0]).order("fecha").limit(6),
    supabase.from("itinerarios").select("*").eq("activo", true).order("orden").order("created_at", { ascending: false }).limit(3),
  ]);

  const lugares = directoriosRes.data ?? [];
  const eventos = eventosRes.data ?? [];
  const itinerarios = itinerariosRes.data ?? [];

  // ── Counts por tipo ──
  const tipoCounts: Record<string, number> = {};
  lugares.forEach((l) => { tipoCounts[l.tipo] = (tipoCounts[l.tipo] || 0) + 1; });

  // ── Primera imagen por tipo ──
  const primeraImagen: Record<string, string> = {};
  lugares.forEach((l) => {
    if (l.image && !primeraImagen[l.tipo]) primeraImagen[l.tipo] = l.image;
  });

  // ── Destacados ──
  const destacados = lugares.filter((l) => l.featured).slice(0, 4);

  // ── Zonas con lugares ──
  const zonasConLugares = new Set(lugares.map((l) => l.zone));
  const zonasConData = ZONAS.filter((z) => zonasConLugares.has(z.id));

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* ═══════════════════════════════════════════
           HERO
         ═══════════════════════════════════════════ */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight">
            <span className="text-[#C96442] italic">Brújula</span> Digital
          </h1>
          <p className="text-[#B8B7B2] mt-3 text-base sm:text-lg max-w-xl mx-auto">
            La guía más completa de Asunción — encontrá qué hacer, dónde ir y qué comer
          </p>
          <p className="mt-1 text-sm text-[#87867F]">
            {lugares.length}+ lugares · {eventos.length} eventos próximos
          </p>

          <div className="mt-6">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           CATEGORÍAS — Cards con imagen de fondo
         ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {TIPO_ORDER.map((tipo) => {
            const count = tipoCounts[tipo] ?? 0;
            const label = TIPO_LABELS[tipo] ?? tipo;
            const imagen = primeraImagen[tipo] ?? TIPO_COVER[tipo] ?? "";
            const grad = GRADIENTS[tipo] ?? "linear-gradient(135deg, #6b7280, #4b5563)";

            return (
              <Link
                key={tipo}
                href={`/guia/${tipo}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] block shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                {imagen ? (
                  <img
                    src={imagen}
                    alt={label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ background: grad }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-sm">{label}</p>
                  <p className="text-white/60 text-xs">{count} lugares</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           DESTACADOS
         ═══════════════════════════════════════════ */}
      {destacados.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 pt-8 border-t border-[#D4D2C9]/50">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="h-5 w-5 text-[#C96442]" />
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Destacados
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {destacados.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] block shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0" style={{ background: GRADIENTS[item.tipo] ?? "#6b7280" }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {item.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-bold text-white text-sm">{item.name}</p>
                    <p className="text-white/60 text-xs">{TIPO_LABELS[item.tipo] ?? item.tipo}</p>
                  </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           EVENTOS PRÓXIMOS — EventCard real
         ═══════════════════════════════════════════ */}
      {eventos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 pt-8 border-t border-[#D4D2C9]/50">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Eventos próximos
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            <Link href="/eventos" className="text-xs text-[#C96442] hover:underline flex items-center gap-1 shrink-0">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {eventos.slice(0, 6).map((e) => (
              <EventCard
                key={e.id}
                event={{
                  id: e.id,
                  titulo: e.titulo,
                  fecha: e.fecha,
                  venue: e.venue ?? "",
                  categoria: e.categoria,
                  image_url: e.image_url,
                }}
                featured
                href={`/eventos/evento/${e.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           ITINERARIOS DESTACADOS
         ═══════════════════════════════════════════ */}
      {itinerarios.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 pt-8 border-t border-[#D4D2C9]/50">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Itinerarios destacados
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            <Link href="/itinerarios" className="text-xs text-[#C96442] hover:underline flex items-center gap-1 shrink-0">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {itinerarios.map((it: any) => (
              <Link
                key={it.id}
                href={`/itinerarios/${it.slug}`}
                className="group bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C96442]/30 transition-all"
              >
                <div className="aspect-[16/9] bg-[#1F1E1D] overflow-hidden relative">
                  {it.imagen ? (
                    <img src={it.imagen} alt={it.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1F1E1D] to-[#2A2825] flex flex-col items-center justify-center gap-2">
                      <Compass className="h-8 w-8 text-white/20" />
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
                        {it.tipo === "escapada" ? "Escapada" : "Itinerario"}
                      </span>
                    </div>
                  )}
                  {it.tipo && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-black/50 backdrop-blur-sm text-white">
                      {it.tipo === "urbano" ? "Urbano" : "Escapada"}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{it.titulo}</h3>
                  {it.duracion_texto && <p className="text-xs text-[#87867F]">{it.duracion_texto}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           ZONAS
         ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#D4D2C9]/50" />
          <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
            Explorá por zona
          </h2>
        </div>

        {/* Zonas principales con foto hero */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {zonasConData.slice(0, 8).map((z) => {
            const hero = getZonaHero(z.id);
            const desc = getZonaDesc(z.id);
            return (
              <Link
                key={z.id}
                href={`/zona/${z.id}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] block shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                {hero ? (
                  <img src={hero} alt={z.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1D] to-[#2A2825]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-sm">{z.label}</p>
                  {desc && <p className="text-white/60 text-xs mt-0.5">{desc}</p>}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Zonas restantes como chips */}
        {zonasConData.length > 8 && (
          <div className="flex flex-wrap gap-2">
            {zonasConData.slice(8).map((z) => (
              <Link
                key={z.id}
                href={`/zona/${z.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D4D2C9] text-sm text-[#5C5B57] hover:border-[#C96442] hover:text-[#C96442] transition-all"
              >
                📍 {z.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
           CTA PROPIEDADES
         ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 mb-14">
        <KohanCtaCompact zona="Asunción" />
      </div>

      {/* ═══════════════════════════════════════════
           FOOTER — sin /admin
         ═══════════════════════════════════════════ */}
      <footer className="border-t border-[#D4D2C9] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#87867F]">
          <div>
            <span className="font-bold text-[#1F1E1D]">
              Bru<span className="text-[#C96442] italic">jula</span>
            </span>
            <span className="ml-2">· Guía de Asunción</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://kohancampos.com.py" target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold text-[#5C5B57] hover:text-[#1F1E1D] transition-colors">
              Kohan &amp; Campos
            </a>
            <Link href="/guia" className="hover:text-[#C96442] transition-colors">Guía</Link>
            <Link href="/itinerarios" className="hover:text-[#C96442] transition-colors">Itinerarios</Link>
            <Link href="/eventos" className="hover:text-[#C96442] transition-colors">Eventos</Link>
          </div>
          <p className="text-xs">{lugares.length} lugares · {eventos.length} eventos próximos</p>
        </div>
      </footer>
    </div>
  );
}
