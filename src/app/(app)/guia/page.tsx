import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShoppingBag, UtensilsCrossed, Beer, Hotel, Film,
  Landmark, TreePine, Building2, Trophy, MicVocal,
  Palmtree, BookOpen, MessageCircle, ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Asunción — Todos los lugares | Brújula Digital",
  description:
    "Guía completa de Asunción con shoppings, museos, restaurantes, bares, hoteles, teatros, parques, centros culturales y más.",
};

const TIPO_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string; desc: string }> = {
  shopping: { icon: ShoppingBag, label: "Shoppings", color: "bg-rose-100 text-rose-600", desc: "Centros comerciales y tiendas" },
  gastronomia: { icon: UtensilsCrossed, label: "Restaurantes", color: "bg-orange-100 text-orange-600", desc: "Restaurantes, cafés y gastronomía" },
  bar: { icon: Beer, label: "Bares", color: "bg-amber-100 text-amber-600", desc: "Bares, pubs y vida nocturna" },
  hotel: { icon: Hotel, label: "Hoteles", color: "bg-blue-100 text-blue-600", desc: "Hoteles y alojamientos" },
  teatro: { icon: Film, label: "Teatros", color: "bg-purple-100 text-purple-600", desc: "Teatros y salas de espectáculos" },
  museo: { icon: Landmark, label: "Museos", color: "bg-emerald-100 text-emerald-600", desc: "Museos y espacios culturales" },
  parque: { icon: TreePine, label: "Parques", color: "bg-green-100 text-green-600", desc: "Parques, plazas y naturaleza" },
  edificio: { icon: Building2, label: "Edificios históricos", color: "bg-stone-100 text-stone-600", desc: "Arquitectura y sitios históricos" },
  estadio: { icon: Trophy, label: "Estadios", color: "bg-yellow-100 text-yellow-600", desc: "Estadios y recintos deportivos" },
  venue: { icon: MicVocal, label: "Espacios para eventos", color: "bg-indigo-100 text-indigo-600", desc: "Venues y espacios multiusos" },
  "centro-cultural": { icon: Palmtree, label: "Centros culturales", color: "bg-teal-100 text-teal-600", desc: "Centros e institutos culturales" },
  libreria: { icon: BookOpen, label: "Librerías", color: "bg-cyan-100 text-cyan-600", desc: "Librerías y espacios de lectura" },
};

const TIPO_ORDER = [
  "shopping", "museo", "gastronomia", "bar", "hotel", "teatro",
  "parque", "edificio", "estadio", "venue", "centro-cultural", "libreria",
];

export default async function GuiaPage() {
  const supabase = await createClient();
  const { data: lugares } = await supabase
    .from("directorios")
    .select("tipo")
    .eq("active", true);

  const counts: Record<string, number> = {};
  (lugares ?? []).forEach((l) => {
    counts[l.tipo] = (counts[l.tipo] || 0) + 1;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            📖 Guía de Asunción
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base">
            {total} lugares · Encontrá qué hacer, dónde ir y qué comer
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {TIPO_ORDER.map((tipo) => {
            const config = TIPO_CONFIG[tipo];
            if (!config) return null;
            const count = counts[tipo] ?? 0;
            const Icon = config.icon;
            return (
              <Link
                key={tipo}
                href={`/guia/${tipo}`}
                className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md hover:border-[#C96442]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${config.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{config.label}</h2>
                    <p className="text-xs text-[#87867F] mt-0.5">{config.desc}</p>
                    <p className="text-xs text-[#C96442] mt-1.5 font-medium">{count} lugares →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-14 bg-gradient-to-br from-[#1F1E1D] to-[#2D2827] rounded-3xl p-8 sm:p-12 text-center">
          <div className="text-4xl mb-3">🏠</div>
          <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-white">
            ¿Buscás propiedad en Asunción?
          </h2>
          <p className="text-[#B8B7B2] text-sm mt-2 max-w-md mx-auto">
            Consultame sin compromiso — te ayudo a encontrar en la zona que te interesa.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "595982000808"}?text=${encodeURIComponent("Hola, vi la Guía de Asunción en Brújula Digital y me interesa saber sobre propiedades.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#22c35e] transition-colors mt-4"
          >
            <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
