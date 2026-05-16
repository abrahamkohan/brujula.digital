import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { KohanCtaCompact } from "@/components/kohan-cta-compact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Asunción — Todos los lugares | Brújula Digital",
  description:
    "Guía completa de Asunción con shoppings, museos, restaurantes, bares, hoteles, teatros, parques, centros culturales y más.",
};

const TIPO_LABELS: Record<string, string> = {
  hotel:           "Hoteles",
  shopping:        "Shoppings",
  gastronomia:     "Restaurantes",
  bar:             "Bares",
  museo:           "Museos",
  teatro:          "Teatros",
  parque:          "Parques",
  edificio:        "Edificios históricos",
  estadio:         "Estadios",
  venue:           "Espacios para eventos",
  "centro-cultural": "Centros culturales",
  libreria:        "Librerías",
  complejo:        "Complejos recreativos",
};

// Turístico primero, cultural después
const TIPO_ORDER = [
  "hotel", "shopping", "gastronomia", "bar",
  "museo", "teatro", "parque", "edificio",
  "estadio", "venue", "centro-cultural", "libreria", "complejo",
];

const TIPO_COVER: Record<string, string> = {
  shopping:          "https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?w=800&h=600&fit=crop",
  hotel:             "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
  gastronomia:       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  bar:               "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop",
  museo:             "https://visitparaguay.travel/storage/places/1046-1.webp",
  parque:            "https://visitparaguay.travel/storage/places/2187-1.webp",
  edificio:          "https://visitparaguay.travel/storage/places/67ee99c03fe63.webp",
  estadio:           "https://upload.wikimedia.org/wikipedia/commons/9/93/Estadio_Defensores_del_Chaco_en_2019.jpg",
  venue:             "https://visitparaguay.travel/storage/places/680bf456d2436.webp",
  "centro-cultural": "https://upload.wikimedia.org/wikipedia/commons/0/03/Entrada_Principal_Manzana_de_la_Rivera.jpg",
  libreria:          "https://visitparaguay.travel/storage/places/630cc4ff52825_1661781247.jpg",
  complejo:          "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&h=600&fit=crop",
};

const GRADIENTS: Record<string, string> = {
  hotel:             "linear-gradient(135deg, #2563eb, #3b82f6)",
  shopping:          "linear-gradient(135deg, #e11d48, #f43f5e)",
  gastronomia:       "linear-gradient(135deg, #ea580c, #f97316)",
  bar:               "linear-gradient(135deg, #d97706, #f59e0b)",
  museo:             "linear-gradient(135deg, #059669, #10b981)",
  teatro:            "linear-gradient(135deg, #7c3aed, #a855f7)",
  parque:            "linear-gradient(135deg, #16a34a, #22c55e)",
  edificio:          "linear-gradient(135deg, #57534e, #78716c)",
  estadio:           "linear-gradient(135deg, #ca8a04, #eab308)",
  venue:             "linear-gradient(135deg, #4f46e5, #6366f1)",
  "centro-cultural": "linear-gradient(135deg, #0d9488, #14b8a6)",
  libreria:          "linear-gradient(135deg, #0891b2, #06b6d4)",
  complejo:          "linear-gradient(135deg, #16a34a, #22c55e)",
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
            Guía de Asunción
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base">
            {total} lugares · Encontrá qué hacer, dónde ir y qué comer
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {TIPO_ORDER.map((tipo) => {
            const count = counts[tipo] ?? 0;
            if (count === 0) return null;
            const label = TIPO_LABELS[tipo] ?? tipo;
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
                  <p className="font-bold text-white text-base">{label}</p>
                  <p className="text-white/60 text-xs mt-1">{count} lugares</p>
                </div>
              </Link>
            );
          })}
        </div>

        <KohanCtaCompact zona="Asunción" />
      </div>
    </div>
  );
}
