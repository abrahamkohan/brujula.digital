import { createClient } from "@/lib/supabase/server";
import { createClient as createDirectClient } from "@supabase/supabase-js";
import { ZONAS } from "@/lib/directorios/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Phone, Globe, Share2, ExternalLink } from "lucide-react";
import { KohanCtaCompact } from "@/components/kohan-cta-compact";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createDirectClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("directorios")
    .select("id")
    .eq("active", true);
  return (data ?? []).map((r) => ({ id: r.id }));
}

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
  complejo: "Complejos recreativos",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("directorios")
    .select("name, descripcion, tipo, zone, image")
    .eq("id", id)
    .single();
  if (!data) return { title: "Lugar no encontrado — Brújula Digital" };
  const zona = ZONAS.find((z) => z.id === data.zone);
  return {
    title: `${data.name} — ${zona?.label ?? data.zone} | Brújula Digital`,
    description:
      data.descripcion ??
      `${data.name} en ${zona?.label ?? data.zone}, Asunción. Horarios, dirección y contacto.`,
    openGraph: {
      title: `${data.name} — Brújula Digital`,
      description: data.descripcion ?? `${data.name} en ${zona?.label ?? data.zone}`,
      images: data.image ? [{ url: data.image }] : [],
      locale: "es_PY",
    },
  };
}

export default async function LugarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lugar } = await supabase
    .from("directorios")
    .select("*")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!lugar) notFound();

  const zona = ZONAS.find((z) => z.id === lugar.zone);
  const tipoLabel = lugar.tipo ? (TIPO_LABELS[lugar.tipo] ?? lugar.tipo) : null;

  const { data: cercanos } = await supabase
    .from("directorios")
    .select("id, name, tipo, zone, image, tipo_lugar")
    .eq("zone", lugar.zone)
    .eq("active", true)
    .neq("id", id)
    .order("featured", { ascending: false })
    .order("sort_order")
    .limit(3);

  const lugarUrl = `https://brujula.digital/guia/lugar/${id}`;
  const shareMsg = encodeURIComponent(`📍 ${lugar.name}\n${lugar.descripcion ?? ""}\n\n${lugarUrl}`);

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {lugar.image ? (
          <img src={lugar.image} alt={lugar.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1F1E1D] to-[#2A2825]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 sm:px-6 pb-6">
          <nav className="flex items-center gap-1.5 text-[#87867F] text-xs mb-3 flex-wrap">
            <Link href="/guia" className="hover:text-white transition-colors">
              Guía
            </Link>
            {lugar.tipo && tipoLabel && (
              <>
                <ArrowRight className="h-3 w-3 shrink-0" />
                <Link href={`/guia/${lugar.tipo}`} className="hover:text-white transition-colors">
                  {tipoLabel}
                </Link>
              </>
            )}
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="text-white/70 truncate max-w-[180px]">{lugar.name}</span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              {lugar.badge && (
                <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white backdrop-blur-sm">
                  {lugar.badge}
                </span>
              )}
              {lugar.featured && (
                <span className="inline-block mb-2 ml-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white">
                  ★ Destacado
                </span>
              )}
              <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {lugar.name}
              </h1>
              {lugar.tipo_lugar && <p className="text-[#B8B7B2] text-sm mt-1">{lugar.tipo_lugar}</p>}
              {lugar.stars !== null && lugar.stars > 0 && (
                <p className="text-amber-400 text-sm mt-1">
                  {"★".repeat(lugar.stars)}
                  {"☆".repeat(Math.max(0, 5 - lugar.stars))}
                  <span className="text-white/50 ml-1.5 text-xs">{lugar.stars}/5</span>
                </p>
              )}
            </div>
            <a
              href={`https://wa.me/?text=${shareMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
              aria-label="Compartir por WhatsApp"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Info card */}
        <div className="bg-white rounded-2xl border border-[#D4D2C9] p-6 space-y-5">
          {lugar.descripcion && (
            <p className="text-[#1F1E1D] text-sm sm:text-base leading-relaxed">{lugar.descripcion}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {zona && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C96442] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#87867F] mb-0.5">Zona</p>
                  <Link
                    href={`/zona/${lugar.zone}`}
                    className="text-[#1F1E1D] hover:text-[#C96442] transition-colors font-medium"
                  >
                    {zona.label} →
                  </Link>
                </div>
              </div>
            )}
            {lugar.direccion && (
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#87867F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#87867F] mb-0.5">Dirección</p>
                  <p className="text-[#1F1E1D]">{lugar.direccion}</p>
                </div>
              </div>
            )}
            {lugar.horario && (
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-[#87867F] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#87867F] mb-0.5">Horario</p>
                  <p className="text-[#1F1E1D]">{lugar.horario}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {(lugar.contacto_whatsapp || lugar.telefono || lugar.website || lugar.instagram || lugar.url) && (
          <div className="space-y-3">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1F1E1D]">Contacto</h2>
            <div className="flex flex-wrap gap-3">
              {lugar.contacto_whatsapp && (
                <a
                  href={`https://wa.me/${lugar.contacto_whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {lugar.telefono && !lugar.contacto_whatsapp && (
                <a
                  href={`tel:${lugar.telefono}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F1E1D] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Phone className="h-4 w-4" />
                  {lugar.telefono}
                </a>
              )}
              {lugar.website && (
                <a
                  href={lugar.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D4D2C9] text-[#1F1E1D] text-sm font-semibold hover:border-[#C96442] transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Sitio web
                </a>
              )}
              {lugar.instagram && (
                <a
                  href={`https://instagram.com/${lugar.instagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D4D2C9] text-[#1F1E1D] text-sm font-semibold hover:border-[#C96442] transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Instagram
                </a>
              )}
              {lugar.url && (
                <a
                  href={lugar.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D4D2C9] text-[#1F1E1D] text-sm font-semibold hover:border-[#C96442] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {/* Nearby */}
        {cercanos && cercanos.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1F1E1D]">
              Cerca de acá
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cercanos.map((c) => (
                <Link
                  key={c.id}
                  href={`/guia/lugar/${c.id}`}
                  className="group bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-md hover:border-[#C96442]/30 transition-all"
                >
                  <div className="aspect-[16/9] bg-[#1F1E1D] overflow-hidden">
                    {c.image && (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm text-[#1F1E1D] group-hover:text-[#C96442] transition-colors line-clamp-1">
                      {c.name}
                    </p>
                    {c.tipo_lugar && <p className="text-xs text-[#87867F] mt-0.5">{c.tipo_lugar}</p>}
                  </div>
                </Link>
              ))}
            </div>
            <Link href={`/zona/${lugar.zone}`} className="text-sm text-[#C96442] hover:underline">
              Ver todo en {zona?.label ?? lugar.zone} →
            </Link>
          </div>
        )}

        {/* CTA Kohan */}
        <KohanCtaCompact zona={zona?.label ?? "Asunción"} />
      </div>
    </div>
  );
}
