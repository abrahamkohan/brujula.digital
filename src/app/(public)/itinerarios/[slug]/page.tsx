import { createClient } from "@/lib/supabase/server";
import { createClient as createAnonClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, ArrowRight, MapPin } from "lucide-react";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const supabase = createAnonClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("itinerarios").select("slug").eq("activo", true);
  return (data ?? []).map((it) => ({ slug: it.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("itinerarios").select("titulo, descripcion").eq("slug", slug).single();
  if (!data) return { title: "Itinerario no encontrado — Brújula Digital" };
  return {
    title: `${data.titulo} — Itinerario Asunción | Brújula Digital`,
    description: data.descripcion || `Itinerario: ${data.titulo} en Asunción. Guía paso a paso.`,
  };
}

export default async function ItinerarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: itinerario } = await supabase
    .from("itinerarios")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!itinerario) notFound();

  const { data: pasos } = await supabase
    .from("itinerario_pasos")
    .select("*")
    .eq("itinerario_id", itinerario.id)
    .order("orden");

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {itinerario.imagen ? (
          <img src={itinerario.imagen} alt={itinerario.titulo} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1D] to-[#2A2825]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 pb-6">
          <Link href="/itinerarios" className="inline-flex items-center gap-1 text-[#87867F] text-sm hover:text-white transition-colors mb-2">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Itinerarios
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl font-bold text-white tracking-tight">{itinerario.titulo}</h1>
          {itinerario.duracion_texto && (
            <p className="text-[#B8B7B2] text-sm mt-1 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {itinerario.duracion_texto}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {itinerario.descripcion && (
          <p className="text-[#5C5B57] text-sm mb-10">{itinerario.descripcion}</p>
        )}

        {(!pasos || pasos.length === 0) ? (
          <p className="text-[#87867F] text-sm">Este itinerario no tiene pasos cargados todavía.</p>
        ) : (
          <div className="space-y-6">
            {pasos.map((paso, i) => (
                <div key={paso.id} className="relative pl-10">
                  {/* Número de paso */}
                  <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#C96442] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                  {/* Línea conectora */}
                  {i < pasos.length - 1 && (
                    <div className="absolute left-[11px] top-7 bottom-0 w-0.5 bg-[#D4D2C9]" />
                  )}

                  <div className="bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-[#1F1E1D]">{paso.lugar_nombre}</h3>
                      </div>
                      {paso.tiempo_estimado && (
                        <span className="shrink-0 text-xs text-[#5C5B57] bg-[#F5F4ED] px-2 py-0.5 rounded-full">{paso.tiempo_estimado}</span>
                      )}
                    </div>
                    {paso.nota && (
                      <p className="text-xs text-[#5C5B57] mt-2">{paso.nota}</p>
                    )}
                    {paso.lugar_url && (
                      <a
                        href={paso.lugar_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#C96442] hover:underline mt-2"
                      >
                        <MapPin className="h-3 w-3" /> Ver en Google Maps
                      </a>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
