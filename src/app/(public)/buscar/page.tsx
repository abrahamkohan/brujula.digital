import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Search, ArrowRight, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar — Brújula Digital",
  description: "Buscá lugares y eventos en Asunción",
};

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="min-h-screen bg-[#F5F4ED] font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <Search className="h-12 w-12 mx-auto text-[#D4D2C9]" />
          <h1 className="text-xl font-bold text-[#1F1E1D] mt-4">Buscá en Brújula Digital</h1>
          <p className="text-[#87867F] text-sm mt-2">Escribí algo para buscar lugares y eventos en Asunción</p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const [lugaresRes, eventosRes] = await Promise.all([
    supabase
      .from("directorios")
      .select("name, tipo, zone, url, id, image")
      .eq("active", true)
      .or(`name.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .limit(20),
    supabase
      .from("eventos")
      .select("id, titulo, fecha, venue, categoria")
      .or(`titulo.ilike.%${query}%,venue.ilike.%${query}%`)
      .limit(10),
  ]);

  const lugares = lugaresRes.data ?? [];
  const eventos = eventosRes.data ?? [];

  const TIPO_LABELS: Record<string, string> = {
    shopping: "Shopping", gastronomia: "Restaurante", bar: "Bar",
    hotel: "Hotel", teatro: "Teatro", museo: "Museo",
    parque: "Parque", edificio: "Edificio", estadio: "Estadio",
    venue: "Eventos", "centro-cultural": "Centro cultural", libreria: "Librería",
  };

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <div className="bg-[#1F1E1D]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Resultados para &ldquo;{query}&rdquo;
          </h1>
          <p className="text-[#87867F] text-sm mt-1">
            {lugares.length + eventos.length} resultados
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {lugares.length === 0 && eventos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#87867F]">Sin resultados para &ldquo;{query}&rdquo;</p>
            <Link href="/guia" className="text-[#C96442] text-sm underline mt-2 inline-block">
              Explorar guía completa →
            </Link>
          </div>
        ) : (
          <>
            {lugares.length > 0 && (
              <section>
                <h2 className="font-semibold text-sm text-[#1F1E1D] mb-3">
                  Lugares ({lugares.length})
                </h2>
                <div className="space-y-2">
                  {lugares.map((l) => (
                    <a
                      key={`${l.tipo}-${l.id}`}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-md hover:border-[#C96442]/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#F5F4ED] overflow-hidden shrink-0">
                        {l.image ? (
                          <img src={l.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-[#87867F]">
                            {l.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1F1E1D] truncate">{l.name}</p>
                        <p className="text-xs text-[#87867F]">
                          {TIPO_LABELS[l.tipo] ?? l.tipo} · {l.zone}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#D4D2C9] shrink-0" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {eventos.length > 0 && (
              <section>
                <h2 className="font-semibold text-sm text-[#1F1E1D] mb-3">
                  Eventos ({eventos.length})
                </h2>
                <div className="space-y-2">
                  {eventos.map((e) => (
                    <Link
                      key={e.id}
                      href={`/eventos/evento/${e.id}`}
                      className="flex items-center gap-3 bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-md hover:border-[#C96442]/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#C96442]/10 flex items-center justify-center shrink-0">
                        <Calendar className="h-5 w-5 text-[#C96442]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1F1E1D] truncate">{e.titulo}</p>
                        <p className="text-xs text-[#87867F]">
                          {new Date(e.fecha + "T12:00:00").toLocaleDateString("es-PY", {
                            day: "numeric",
                            month: "short",
                          })}
                          {e.venue ? ` · ${e.venue}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#D4D2C9] shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
