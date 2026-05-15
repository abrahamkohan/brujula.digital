import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

const GRADIENT_STYLES: Record<string, string> = {
  concierto:       "linear-gradient(135deg, #7c3aed, #db2777)",
  deporte:         "linear-gradient(135deg, #059669, #0891b2)",
  teatro:          "linear-gradient(135deg, #7c3aed, #a855f7)",
  feria:           "linear-gradient(135deg, #d97706, #dc2626)",
  entretenimiento: "linear-gradient(135deg, #db2777, #ef4444)",
  congreso:        "linear-gradient(135deg, #2563eb, #4f46e5)",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("eventos")
    .select("titulo, venue, fecha, image_url")
    .eq("id", id)
    .single();

  if (!data) return { title: "Evento — Brújula Digital" };

  const description = `${formatDate(data.fecha)} · ${data.venue} · Asunción`;

  return {
    title: `${data.titulo} — Brújula Digital`,
    description,
    openGraph: {
      title: data.titulo,
      description,
      images: data.image_url ? [{ url: data.image_url, width: 1200, height: 630 }] : [],
      type: "website",
      siteName: "Brújula Digital",
    },
    twitter: {
      card: "summary_large_image",
      title: data.titulo,
      description,
      images: data.image_url ? [data.image_url] : [],
    },
  };
}

export default async function EventoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: evento } = await supabase
    .from("eventos")
    .select("id, titulo, categoria, fecha, venue, image_url, source_url")
    .eq("id", id)
    .single();

  if (!evento) notFound();

  const gradStyle = GRADIENT_STYLES[evento.categoria?.toLowerCase()] ?? "linear-gradient(135deg, #6b7280, #4b5563)";
  const hasImage =
    evento.image_url?.startsWith("http") &&
    !evento.image_url.includes("ticketea.com.py") &&
    !evento.image_url.includes("tuti.com.py");

  const shareText = encodeURIComponent(
    `📍 ${evento.titulo}\n${formatDate(evento.fecha)} · ${evento.venue}\n\nhttps://brujula.digital/eventos/evento/${id}`
  );

  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      <div className="sticky top-0 z-40 bg-[#F5F4ED]/95 backdrop-blur-sm border-b border-[#D4D2C9]/50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <Link href="/eventos" className="flex items-center gap-1.5 text-sm font-medium text-[#5C5B57] hover:text-[#C96442] transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
          {hasImage ? (
            <img
              src={evento.image_url!}
              alt={evento.titulo}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: gradStyle }} />
          )}
        </div>

        <div className="space-y-3">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-bold text-[#1F1E1D] leading-tight">
            {evento.titulo}
          </h1>

          <div className="flex flex-col gap-2 text-sm text-[#5C5B57]">
            {evento.fecha && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#C96442] shrink-0" />
                {formatDate(evento.fecha)}
              </span>
            )}
            {evento.venue && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#C96442] shrink-0" />
                {evento.venue}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {evento.source_url && (
            <a
              href={evento.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#b5593b] transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Ver entradas
            </a>
          )}
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#D4D2C9] text-[#1F1E1D] text-sm font-medium hover:border-[#C96442] transition-colors"
          >
            Compartir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
