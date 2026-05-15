import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Itinerarios en Asunción — Qué hacer en un día | Brújula Digital",
  description: "Descubrí itinerarios armados para recorrer Asunción: planes de un día, rutas culturales, gastronómicas y más.",
};

export default async function ItinerariosPage() {
  const supabase = await createClient();
  const { data: itinerarios } = await supabase
    .from("itinerarios")
    .select("*")
    .eq("activo", true)
    .order("orden")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Itinerarios
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base">
            Planes armados para recorrer Asunción
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {(!itinerarios || itinerarios.length === 0) ? (
          <p className="text-center text-[#87867F] py-12">Todavía no hay itinerarios. Pronto vamos a tener rutas armadas para recorrer Asunción.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {itinerarios.map((it) => (
              <Link
                key={it.id}
                href={`/itinerarios/${it.slug}`}
                className="group bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C96442]/30 transition-all"
              >
                <div className="aspect-[16/9] bg-[#1F1E1D] overflow-hidden relative">
                  {it.imagen ? (
                    <img src={it.imagen} alt={it.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🗺️</div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h2 className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{it.titulo}</h2>
                  <p className="text-xs text-[#87867F] line-clamp-2">{it.descripcion}</p>
                  {it.duracion_texto && (
                    <p className="text-xs text-[#5C5B57] flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {it.duracion_texto}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
