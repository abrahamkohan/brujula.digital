import { createClient } from "@/lib/supabase/server";
import { ZONAS } from "@/lib/directorios/types";
import Link from "next/link";
import {
  ShoppingBag, UtensilsCrossed, Beer, Hotel, Film,
  Landmark, TreePine, Building2, Trophy, MicVocal,
  Palmtree, BookOpen, Compass, Search, MessageCircle,
  ArrowRight, Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

// ─── Config ────────────────────────────────────────────────────
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595982000808";

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

// ─── Config de tipos ──────────────────────────────────────────

const TIPO_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  shopping: { icon: ShoppingBag, label: "Shoppings", color: "bg-rose-100 text-rose-600" },
  gastronomia: { icon: UtensilsCrossed, label: "Restaurantes", color: "bg-orange-100 text-orange-600" },
  bar: { icon: Beer, label: "Bares", color: "bg-amber-100 text-amber-600" },
  hotel: { icon: Hotel, label: "Hoteles", color: "bg-blue-100 text-blue-600" },
  teatro: { icon: Film, label: "Teatros", color: "bg-purple-100 text-purple-600" },
  museo: { icon: Landmark, label: "Museos", color: "bg-emerald-100 text-emerald-600" },
  parque: { icon: TreePine, label: "Parques", color: "bg-green-100 text-green-600" },
  edificio: { icon: Building2, label: "Edificios históricos", color: "bg-stone-100 text-stone-600" },
  estadio: { icon: Trophy, label: "Estadios", color: "bg-yellow-100 text-yellow-600" },
  venue: { icon: MicVocal, label: "Espacios para eventos", color: "bg-indigo-100 text-indigo-600" },
  "centro-cultural": { icon: Palmtree, label: "Centros culturales", color: "bg-teal-100 text-teal-600" },
  libreria: { icon: BookOpen, label: "Librerías", color: "bg-cyan-100 text-cyan-600" },
};

const TIPO_ORDER = [
  "shopping", "museo", "gastronomia", "bar", "hotel",
  "teatro", "parque", "edificio", "estadio", "venue",
  "centro-cultural", "libreria",
];

// ═══════════════════════════════════════════════════════════════

export default async function HomePage() {
  const supabase = await createClient();

  // ── Fetch data ──
  const [directoriosRes, eventosRes] = await Promise.all([
    supabase.from("directorios").select("tipo, name, zone, featured, badge, image, descripcion, horario, stars, url, id").eq("active", true),
    supabase.from("eventos").select("id, titulo, fecha, venue, categoria, image_url").gte("fecha", new Date().toISOString().split("T")[0]).order("fecha").limit(6),
  ]);

  const lugares = directoriosRes.data ?? [];
  const eventos = eventosRes.data ?? [];

  // ── Counts por tipo ──
  const tipoCounts: Record<string, number> = {};
  lugares.forEach((l) => {
    tipoCounts[l.tipo] = (tipoCounts[l.tipo] || 0) + 1;
  });

  // ── Destacados ──
  const destacados = lugares.filter((l) => l.featured).slice(0, 4);

  // ── Zonas con lugares ──
  const zonasConLugares = new Set(lugares.map((l) => l.zone));
  const zonasConData = ZONAS.filter((z) => zonasConLugares.has(z.id));

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
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
          <div className="mt-2 text-sm text-[#87867F]">
            {lugares.length}+ lugares · {eventos.length} eventos próximos
          </div>

          {/* Search */}
          {/* Search */}
          <Link
            href="/guia"
            className="relative max-w-2xl mx-auto mt-6 flex items-center bg-white rounded-2xl pl-14 pr-6 py-3.5 text-sm text-[#87867F] shadow-sm hover:shadow-md transition-shadow"
          >
            <Search className="absolute left-5 h-5 w-5 text-[#87867F]" />
            Buscá shoppings, museos, restaurantes...
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           CATEGORÍAS
         ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TIPO_ORDER.map((tipo) => {
            const config = TIPO_CONFIG[tipo];
            if (!config) return null;
            const count = tipoCounts[tipo] ?? 0;
            const Icon = config.icon;
            return (
              <Link
                key={tipo}
                href={`/guia/${tipo}`}
                className="bg-white rounded-2xl border border-[#D4D2C9] p-4 hover:shadow-md hover:border-[#C96442]/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-[#1F1E1D]">{config.label}</p>
                <p className="text-xs text-[#87867F] mt-0.5">{count} lugares</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           DESTACADOS
         ═══════════════════════════════════════════ */}
      {destacados.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="h-5 w-5 text-[#C96442]" />
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Destacados
            </h2>
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {destacados.map((item) => {
              const config = TIPO_CONFIG[item.tipo];
              const Icon = config?.icon ?? Compass;
              return (
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
                      <div className="w-full h-full flex items-center justify-center text-[#D4D2C9]"><Icon className="h-8 w-8" /></div>
                    )}
                    {item.badge && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white backdrop-blur-sm">{item.badge}</span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{item.name}</h3>
                    <p className="text-xs text-[#87867F]">{config?.label ?? item.tipo}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
           EVENTOS PRÓXIMOS
         ═══════════════════════════════════════════ */}
      {eventos.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
              Eventos próximos
            </h2>
            <Link href="/eventos" className="text-xs text-[#C96442] hover:underline flex items-center gap-1">
              Ver todos <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {eventos.map((e) => (
              <Link
                key={e.id}
                href={`/eventos/evento/${e.id}`}
                className="bg-white rounded-2xl border border-[#D4D2C9] p-4 hover:shadow-md hover:border-[#C96442]/30 transition-all flex items-start gap-3"
              >
                <div className="w-3 h-3 rounded-full mt-0.5 bg-[#C96442] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1F1E1D] truncate">{e.titulo}</p>
                  <p className="text-xs text-[#87867F] mt-0.5">
                    {new Date(e.fecha + "T12:00:00").toLocaleDateString("es-PY", { day: "numeric", month: "short" })}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </p>
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
        <div className="flex flex-wrap gap-2">
          {zonasConData.map((z) => (
            <Link
              key={z.id}
              href={`/zona/${z.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#D4D2C9] text-sm text-[#5C5B57] hover:border-[#C96442] hover:text-[#C96442] transition-all"
            >
              📍 {z.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           CTA PROPIEDADES
         ═══════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 mb-14">
        <div className="bg-gradient-to-br from-[#1F1E1D] to-[#2D2827] rounded-3xl p-8 sm:p-12 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-4xl">🏠</div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              ¿Buscás propiedad en Asunción?
            </h2>
            <p className="text-[#B8B7B2] text-sm sm:text-base">
              Te ayudo a encontrar casas, departamentos y terrenos en la zona que te interesa.
              Consultame sin compromiso.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, vi Brújula Digital y me interesa saber sobre propiedades en Asunción. ¿Podés darme más info?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#22c35e] transition-colors shadow-lg hover:shadow-xl mt-2"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
            <p className="text-[#87867F] text-xs">Respuesta rápida · Sin compromiso</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
           FOOTER
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
            <Link href="/eventos" className="hover:text-[#C96442] transition-colors">Eventos</Link>
            <Link href="/admin" className="hover:text-[#C96442] transition-colors">Admin</Link>
          </div>
          <p className="text-xs">{lugares.length} lugares · {eventos.length} eventos próximos</p>
        </div>
      </footer>
    </div>
  );
}
