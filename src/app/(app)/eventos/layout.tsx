import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brújula — Eventos en Paraguay",
  description: "Descubrí eventos, recitales, gastronomía, bares, cine y más en Paraguay. La guía del turista para saber qué hacer hoy.",
  openGraph: {
    title: "¿Qué hay hoy? — Brújula Digital",
    description: "Eventos, recitales, gastronomía, bares, cine y más en Paraguay. Actualizado hoy.",
    siteName: "Brújula Digital",
    type: "website",
  },
};

export default function EventosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
