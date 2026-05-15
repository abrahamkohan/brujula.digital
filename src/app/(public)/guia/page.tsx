import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Asunción — Todos los lugares | Brújula Digital",
  description:
    "Guía completa de Asunción con shoppings, museos, restaurantes, bares, hoteles, teatros, parques, centros culturales y más.",
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

export default async function GuiaPage() {
  const supabase = await createClient();
  const { data: lugares } = await supabase
    .from("directorios")
    .select("tipo, image")
    .eq("active", true);

  const counts: Record<string, number> = {};
  const primeraImagen: Record<string, string> = {};
  (lugares ?? []).forEach((l) => {
    counts[l.tipo] = (counts[l.tipo] || 0) + 1;
    if (l.image && !primeraImagen[l.tipo]) primeraImagen[l.tipo] = l.image;
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
            const count = counts[tipo] ?? 0;
            const label = TIPO_LABELS[tipo] ?? tipo;
            const imagen = primeraImagen[tipo];
            const grad = GRADIENTS[tipo] ?? "linear-gradient(135deg, #6b7280, #4b5563)";
            return (
              <Link
                key={tipo}
                href={`/guia/${tipo}`}
                className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] aspect-[4/3]"
              >
                {imagen ? (
                  <img src={imagen} alt={label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0" style={{ background: grad }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-bold text-white text-base">{label}</p>
                  <p className="text-white/60 text-xs mt-1">{count} lugares</p>
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
