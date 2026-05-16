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
      <div className="relative overflow-hidden bg-[#1F1E1D]" style={{ minHeight: 520, height: "70vh", maxHeight: 720 }}>
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

            {/* Apps con logos */}
            <div className="flex-1 px-5 py-3.5 flex items-center gap-3 flex-wrap">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg"
                alt="Uber"
                className="h-4"
              />
              <span className="text-[#D4D2C9] font-light">·</span>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Bolt_logo.png/330px-Bolt_logo.png"
                alt="Bolt"
                className="h-4"
              />
              <span className="text-[#D4D2C9] font-light">·</span>
              <svg viewBox="0 0 101 26" className="h-3.5 shrink-0" aria-label="MUV">
                <path d="M69.7809 0.268273C69.2349 0.106999 68.617 0.0253906 67.9408 0.0253906C66.8858 0.0253906 66.0231 0.276045 65.3857 0.769581C64.6921 1.30392 64.3423 2.14138 64.3423 3.25281V13.7725C64.3423 15.7408 63.8857 17.2389 62.9861 18.2279C62.1059 19.1956 60.6971 19.6852 58.8007 19.6852C56.9043 19.6852 55.4956 19.1956 54.6154 18.2279C53.7157 17.2409 53.2591 15.7428 53.2591 13.7725V0.77541L52.8083 0.598592C52.6237 0.524756 52.2895 0.417888 51.7882 0.268273C51.2442 0.106999 50.6418 0.0253906 49.9967 0.0253906C48.9086 0.0253906 48.0323 0.276045 47.393 0.769581C46.7013 1.30392 46.3496 2.14138 46.3496 3.25281V14.9636C46.3496 16.6735 46.6605 18.2338 47.2764 19.6056C47.8943 20.9812 48.7648 22.1607 49.8646 23.1108C50.9585 24.059 52.2895 24.7877 53.8187 25.2754C55.3285 25.7553 57.0034 26.0002 58.8007 26.0002C60.598 26.0002 62.273 25.7553 63.7808 25.2754C65.308 24.7896 66.6448 24.061 67.7563 23.1147C68.8755 22.1607 69.7479 20.9793 70.3502 19.5997C70.9487 18.2299 71.2518 16.6716 71.2518 14.9655V0.77541L70.801 0.598592C70.6164 0.524756 70.2822 0.417888 69.7829 0.268273" fill="#FF6200" />
                <path d="M39.3974 2.90888C38.286 1.96261 36.9492 1.23396 35.4219 0.748197C33.9141 0.268263 32.2372 0.0234375 30.4419 0.0234375C28.6465 0.0234375 26.9696 0.268263 25.4599 0.748197C23.9307 1.2359 22.5997 1.96261 21.5057 2.91276C21.4902 2.92636 21.4747 2.94191 21.4591 2.95551C21.4416 2.93996 21.4241 2.92442 21.4066 2.90888C20.2952 1.96261 18.9584 1.23396 17.4312 0.748197C15.9214 0.268263 14.2465 0.0253806 12.4492 0.0253806C10.6518 0.0253806 8.97692 0.270206 7.46716 0.75014C5.93798 1.23785 4.60699 1.96455 3.51305 2.9147C2.41328 3.86486 1.54279 5.04429 0.924895 6.41998C0.310889 7.78789 0 9.35011 0 11.06V22.7688C0 23.8803 0.351693 24.7177 1.04342 25.2521C1.68269 25.7456 2.55706 25.9963 3.64712 25.9963C4.29221 25.9963 4.89456 25.9147 5.43861 25.7534C5.93992 25.6038 6.27218 25.4969 6.45872 25.4231L6.90951 25.2462V12.2491C6.90951 10.2789 7.36613 8.78079 8.26576 7.79372C9.14596 6.82608 10.5547 6.33643 12.4511 6.33643C14.3475 6.33643 15.7543 6.82608 16.6345 7.79372C17.5341 8.78079 17.9908 10.2789 17.9908 12.2491V22.7688C17.9908 23.7423 18.2589 24.504 18.7913 25.0364C18.8671 25.1122 18.9487 25.1841 19.0342 25.2521C19.0555 25.2676 19.0769 25.2812 19.0983 25.2968C19.7298 25.7592 20.5672 25.9963 21.5893 25.9963C21.5971 25.9963 21.6048 25.9963 21.6126 25.9963C21.6204 25.9963 21.6282 25.9963 21.6379 25.9963C22.2733 25.9963 22.8659 25.9166 23.4041 25.7592C23.4119 25.7573 23.4216 25.7553 23.4313 25.7514C23.7675 25.6523 24.0259 25.5707 24.2163 25.5066C24.3096 25.4755 24.3892 25.4464 24.4495 25.4231L24.9003 25.2462V12.2491C24.9003 10.2789 25.3569 8.78079 26.2565 7.79372C27.1367 6.82608 28.5454 6.33643 30.4419 6.33643C32.3383 6.33643 33.7451 6.82608 34.6272 7.79372C35.5268 8.78079 35.9835 10.2789 35.9835 12.2491V22.7688C35.9835 23.8803 36.3332 24.7177 37.0269 25.2521C37.6642 25.7456 38.5269 25.9963 39.582 25.9963C40.2582 25.9963 40.878 25.9147 41.4221 25.7534C41.9234 25.6038 42.2556 25.4969 42.4402 25.4231L42.891 25.2462V11.06C42.891 9.35399 42.5879 7.79566 41.9894 6.42581C41.389 5.04624 40.5166 3.86292 39.3955 2.91082" fill="#FF6200" />
                <path d="M81.4507 0.784995L86.081 18.766C86.3492 19.7376 87.379 19.6734 87.379 19.6734C87.379 19.6734 88.4088 19.7298 88.6983 18.7621L92.6272 3.11278C92.8778 1.69629 93.5579 1.02399 94.2108 0.62955C94.9005 0.211793 95.6214 0.0291458 96.6765 0.0291458C97.3527 0.0291458 97.9725 0.110754 98.5166 0.272028C98.5166 0.272028 99.5542 0.575145 100.137 0.75002L95.2464 19.6715C93.6784 26.2507 87.377 25.9728 87.377 25.9728C80.1799 25.9961 79.1637 19.6715 79.1637 19.6715L74.8715 3.22742C74.7316 2.15096 75.2232 1.27853 75.9149 0.74419C76.5542 0.250654 77.4286 0 78.5186 0C79.1637 0 79.7661 0.0816083 80.3101 0.242882C80.3101 0.242882 80.7901 0.378896 81.4488 0.783052" fill="#FF6200" />
              </svg>
              <span className="text-xs text-[#87867F] ml-1 shrink-0">Desde USD 5</span>
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
                  href={`/zona/${z.id}`}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
