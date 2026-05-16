import { createClient } from "@/lib/supabase/server";
import { ZONAS } from "@/lib/directorios/types";
import { getZonaHero, getZonaDesc } from "@/lib/zonas-images";
import Link from "next/link";
import {
  Compass, ArrowRight, Sparkles,
  Car, Bus, MapPin,
} from "lucide-react";
import type { Metadata } from "next";
import EventCard from "@/components/eventos/event-card";
import { SearchBar } from "@/components/search-bar";
import { KohanCtaCompact } from "@/components/kohan-cta-compact";

export const metadata: Metadata = {
  title: "Brújula Digital — Guía de Asunción",
  description:
    "La guía más completa de Asunción: restaurantes, bares, hoteles, shoppings, eventos y escapadas. Todo lo que necesitás desde que aterrizás.",
  openGraph: {
    title: "Brújula Digital — Guía de Asunción",
    description: "Todo lo que necesitás desde que aterrizás en Asunción.",
    locale: "es_PY",
    siteName: "Brújula Digital",
  },
};

// Categorías que aparecen en portada — las 4 de mayor demanda turística
const PORTADA_TIPOS = [
  { tipo: "gastronomia", label: "Restaurantes", emoji: "🍽️" },
  { tipo: "bar",         label: "Bares",        emoji: "🍺" },
  { tipo: "shopping",    label: "Shoppings",    emoji: "🛍️" },
  { tipo: "complejo",    label: "Escapadas",    emoji: "🌿" },
];

// Zonas con contexto de distancia al aeropuerto
const ZONAS_HOTEL = [
  { id: "carmelitas",  label: "Carmelitas",       dist: "15–20 min del aeropuerto", sub: "La más cercana" },
  { id: "villa-morra", label: "Villa Morra",       dist: "20–25 min",               sub: "Zona residencial y gastronómica" },
  { id: "centro",      label: "Centro Histórico",  dist: "40–50 min",               sub: "Para turismo cultural" },
];

const GRADIENTS: Record<string, string> = {
  gastronomia:  "linear-gradient(135deg, #ea580c, #f97316)",
  bar:          "linear-gradient(135deg, #d97706, #f59e0b)",
  shopping:     "linear-gradient(135deg, #e11d48, #f43f5e)",
  complejo:     "linear-gradient(135deg, #16a34a, #22c55e)",
};

const TIPO_COVER: Record<string, string> = {
  gastronomia: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  bar:         "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop",
  shopping:    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop",
  complejo:    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [directoriosRes, eventosRes, itinerariosRes] = await Promise.all([
    supabase
      .from("directorios")
      .select("tipo, name, zone, featured, badge, image, descripcion, horario, stars, url, id")
      .eq("active", true),
    supabase
      .from("eventos")
      .select("id, titulo, fecha, venue, categoria, image_url, source_url")
      .gte("fecha", new Date().toISOString().split("T")[0])
      .order("fecha")
      .limit(6),
    supabase
      .from("itinerarios")
      .select("*")
      .eq("activo", true)
      .order("orden")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const lugares  = directoriosRes.data ?? [];
  const eventos  = eventosRes.data ?? [];
  const itinerarios = itinerariosRes.data ?? [];

  // Counts y primera imagen por tipo
  const tipoCounts: Record<string, number> = {};
  const primeraImagen: Record<string, string> = {};
  lugares.forEach((l) => {
    tipoCounts[l.tipo] = (tipoCounts[l.tipo] || 0) + 1;
    if (l.image && !primeraImagen[l.tipo]) primeraImagen[l.tipo] = l.image;
  });

  // Hoteles por zona turística
  const hotelesPorZona = ZONAS_HOTEL.map((z) => ({
    ...z,
    hoteles: lugares
      .filter((l) => l.tipo === "hotel" && l.zone === z.id && l.featured)
      .slice(0, 2),
    total: lugares.filter((l) => l.tipo === "hotel" && l.zone === z.id).length,
  }));

  // Destacados (cualquier tipo)
  const destacados = lugares.filter((l) => l.featured).slice(0, 4);

  // Zonas con lugares
  const zonasConLugares = new Set(lugares.map((l) => l.zone));
  const zonasConData = ZONAS.filter((z) => zonasConLugares.has(z.id));

  return (
    <div className="min-h-screen bg-[#F5F4ED]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1F1E1D] h-[420px] sm:h-[70vh] sm:min-h-[520px] sm:max-h-[720px]">
        <img
          src="https://images.unsplash.com/photo-1646837599229-b053e578d75e?w=1920&h=1080&fit=crop&auto=format&q=80"
          alt="Asunción, Paraguay"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/80" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 pb-14">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
            <span className="text-[#C96442] italic">Brújula</span> Digital
          </h1>
          <p className="text-white/75 mt-3 text-base sm:text-lg max-w-xl drop-shadow">
            La guía del viajero en Asunción — todo lo que necesitás desde que aterrizás
          </p>
          <div className="mt-6 w-full max-w-xl">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* ── CÓMO LLEGAR — teaser ─────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl border border-[#D4D2C9] shadow-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row items-stretch divide-y sm:divide-y-0 sm:divide-x divide-[#D4D2C9]/60">

            {/* Label */}
            <div className="shrink-0 px-5 py-3 sm:flex sm:flex-col sm:justify-center bg-[#F5F4ED]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#87867F]">Desde el</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#87867F]">aeropuerto</p>
            </div>

            {/* Apps — texto limpio */}
            <div className="flex-1 px-5 py-3.5 flex items-center gap-3 flex-wrap">
              <Smartphone className="h-4 w-4 text-[#C96442] shrink-0" />
              <span className="text-xs font-semibold text-[#1F1E1D]">Uber · Bolt · MUV</span>
            </div>

            {/* Taxi */}
            <div className="px-4 py-3 flex items-center gap-2">
              <Car className="h-4 w-4 text-[#87867F] shrink-0" />
              <p className="text-xs text-[#5C5B57]">Taxi oficial</p>
            </div>

            {/* Línea 30 */}
            <div className="px-4 py-3 flex items-center gap-2">
              <Bus className="h-4 w-4 text-[#87867F] shrink-0" />
              <p className="text-xs text-[#5C5B57]">Línea 30</p>
            </div>

            {/* CTA */}
            <Link
              href="/como-llegar"
              className="shrink-0 flex items-center gap-1.5 px-5 py-4 sm:py-0 text-xs font-semibold text-[#C96442] hover:bg-[#C96442]/5 transition-colors whitespace-nowrap"
            >
              Ver precios y tiempos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 py-12">

        {/* ── HOTELES POR ZONA ─────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              ¿Dónde quedarse?
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            <Link href="/guia/hotel" className="text-xs text-[#C96442] hover:underline flex items-center gap-1 shrink-0">
              Ver todos los hoteles <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {hotelesPorZona.map((z) => {
              const heroImg = getZonaHero(z.id);
              return (
                <Link
                  key={z.id}
                  href={`/guia/hotel?zona=${z.id}`}
                  className="group relative rounded-2xl overflow-hidden h-52 block shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  {heroImg ? (
                    <img
                      src={heroImg}
                      alt={z.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1D] to-[#2A2825]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium bg-black/40 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                    <MapPin className="h-2.5 w-2.5" /> {z.dist}
                  </span>

                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5">
                    <div>
                      <h3 className="font-bold text-white text-base">{z.label}</h3>
                      <p className="text-white/60 text-xs mt-0.5">{z.sub}</p>
                    </div>
                    {z.hoteles.length > 0 && (
                      <ul className="space-y-0.5">
                        {z.hoteles.map((h) => (
                          <li key={h.id} className="text-xs text-white/70 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-white/40 shrink-0" />
                            {h.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-xs font-semibold text-[#C96442] flex items-center gap-1 pt-0.5">
                      {z.total} hoteles disponibles <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── QUÉ HACER — 4 categorías ─────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              ¿Qué hacer en Asunción?
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PORTADA_TIPOS.map(({ tipo, label, emoji }) => {
              const count  = tipoCounts[tipo] ?? 0;
              const imagen = primeraImagen[tipo] ?? TIPO_COVER[tipo] ?? "";
              const grad   = GRADIENTS[tipo] ?? "linear-gradient(135deg, #6b7280, #4b5563)";

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
                    <p className="font-bold text-white text-sm">{emoji} {label}</p>
                    <p className="text-white/60 text-xs">{count} lugares</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/guia"
              className="inline-flex items-center gap-1.5 text-sm text-[#C96442] hover:underline font-medium"
            >
              Ver guía completa — museos, teatros, parques y más <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>

        {/* ── DESTACADOS ───────────────────────────────────── */}
        {destacados.length > 0 && (
          <section>
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
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: GRADIENTS[item.tipo] ?? "#6b7280" }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {item.badge && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-bold text-white text-sm">{item.name}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── EVENTOS PRÓXIMOS ─────────────────────────────── */}
        {eventos.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
                Eventos próximos
              </h2>
              <div className="flex-1 h-px bg-[#D4D2C9]/50" />
              <Link href="/eventos" className="text-xs text-[#C96442] hover:underline flex items-center gap-1 shrink-0">
                Ver todos <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventos.map((e) => (
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
          </section>
        )}

        {/* ── ITINERARIOS ──────────────────────────────────── */}
        {itinerarios.length > 0 && (
          <section>
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
                      <img
                        src={it.imagen}
                        alt={it.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1F1E1D] to-[#2A2825] flex items-center justify-center">
                        <Compass className="h-8 w-8 text-white/20" />
                      </div>
                    )}
                    {it.tipo && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-black/50 backdrop-blur-sm text-white">
                        {it.tipo === "urbano" ? "Urbano" : "Escapada"}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">
                      {it.titulo}
                    </h3>
                    {it.duracion_texto && (
                      <p className="text-xs text-[#87867F]">{it.duracion_texto}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── ZONAS ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Explorá por zona
            </h2>
          </div>
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
                    <img
                      src={hero}
                      alt={z.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
        </section>

        {/* ── CTA KOHAN ────────────────────────────────────── */}
        <KohanCtaCompact zona="Asunción" />

      </div>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#D4D2C9] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#87867F]">
          <div>
            <span className="font-bold text-[#1F1E1D]">
              Bru<span className="text-[#C96442] italic">jula</span>
            </span>
            <span className="ml-2">· Guía de Asunción</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://kohancampos.com.py"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#5C5B57] hover:text-[#1F1E1D] transition-colors"
            >
              Kohan &amp; Campos
            </a>
            <Link href="/como-llegar" className="hover:text-[#C96442] transition-colors">Cómo llegar</Link>
            <Link href="/guia"       className="hover:text-[#C96442] transition-colors">Guía</Link>
            <Link href="/itinerarios" className="hover:text-[#C96442] transition-colors">Itinerarios</Link>
            <Link href="/eventos"    className="hover:text-[#C96442] transition-colors">Eventos</Link>
          </div>
          <p className="text-xs">{lugares.length} lugares · {eventos.length} eventos próximos</p>
        </div>
      </footer>
    </div>
  );
}
