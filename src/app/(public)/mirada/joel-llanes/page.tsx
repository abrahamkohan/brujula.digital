"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, MapPin } from "lucide-react";

const LUGARES = [
  {
    id: "costanera",
    nombre: "Costanera de Asunción",
    descripcion: "El atardecer sobre el río es mi momento favorito del día. Acá desconecto de todo.",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    zona: "Costanera",
    tiempo: "Última hora de la tarde",
  },
  {
    id: "cerro-lambare",
    nombre: "Cerro Lambaré",
    descripcion: "La mejor vista panorámica de Asunción. Nadie se la espera.",
    imagen: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=600&fit=crop",
    zona: "Afueras de Asunción",
    tiempo: "Mañana temprano",
  },
  {
    id: "loma-san-jeronimo",
    nombre: "Loma San Jerónimo",
    descripcion: "Calles coloridas que parecen de otro país. Mi rincón favorito para fotos.",
    imagen: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
    zona: "San Jerónimo",
    tiempo: "Media mañana",
  },
  {
    id: "paseo-la-galeria",
    nombre: "Paseo La Galería",
    descripcion: "No es solo shopping — es donde Asunción se pone moderna.",
    imagen: "https://visitparaguay.travel/storage/places/oZ78EzSOklYrWRTjLw54gW9kNRAKUFH6AoefZZFS.jpg",
    zona: "Villa Morra",
    tiempo: "Tarde",
  },
  {
    id: "jardin-botanico",
    nombre: "Jardín Botánico",
    descripcion: "El pulmón verde de la ciudad. Vine de chico y sigo viniendo.",
    imagen: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    zona: "Asunción",
    tiempo: "Fin de semana",
  },
];

export default function JoelLlanesPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setVisibleItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll("[data-index]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans">
      {/* Hero — viewport completo */}
      <div className="relative h-screen overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop"
          alt="Asunción"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />

        {/* ← Escape */}
        <Link
          href="/guia"
          className="absolute top-6 left-4 sm:left-6 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm hidden sm:inline">Guía</span>
        </Link>

        {/* Centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[#C96442] text-sm tracking-[0.3em] uppercase mb-4">
            La Asunción de
          </p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl sm:text-7xl font-bold tracking-tight leading-none">
            Joel Llanes
          </h1>
          <p className="text-white/50 text-sm mt-4 max-w-xs">
            Viajes · estilo de vida · Paraguay
          </p>
        </div>

        {/* ↓ Descubrir */}
        {!scrolled && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-white/40 text-[11px] tracking-widest uppercase">Descubrir</span>
            <ChevronDown className="h-5 w-5 text-white/40" />
          </div>
        )}
      </div>

      {/* Pull quote */}
      <div className="py-20 sm:py-32 px-6 text-center bg-[#0D0D0D]">
        <blockquote className="max-w-2xl mx-auto">
          <p className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl text-white/90 leading-relaxed italic">
            &ldquo;Asunción no se explica — se camina, se mira, se siente.&rdquo;
          </p>
          <footer className="mt-4 text-white/30 text-sm">— Joel Llanes</footer>
        </blockquote>
      </div>

      {/* Lugares — layout alternado */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 space-y-20">
        {LUGARES.map((lugar, i) => {
          const isEven = i % 2 === 0;
          const visible = visibleItems.has(i);
          return (
            <div
              key={lugar.id}
              data-index={i}
              className={`flex flex-col ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"} gap-6 sm:gap-10 items-center transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {/* Número */}
              <div className={`shrink-0 hidden sm:flex items-center justify-center w-16 h-16 rounded-full border border-white/10 text-white/20 text-2xl font-bold ${visible ? "opacity-100" : "opacity-0"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* Foto */}
              <div className="w-full sm:w-[55%] aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={lugar.imagen}
                  alt={lugar.nombre}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Texto */}
              <div className="flex-1 space-y-3 px-2">
                <p className="text-[#C96442] text-xs tracking-widest uppercase">
                  {lugar.tiempo}
                </p>
                <h3 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold">
                  {lugar.nombre}
                </h3>
                <div className="flex items-center gap-1.5 text-white/40 text-sm">
                  <MapPin className="h-3.5 w-3.5" /> {lugar.zona}
                </div>
                <p className="text-white/60 text-sm leading-relaxed">
                  {lugar.descripcion}
                </p>
                <p className="text-white/20 text-xs italic">Recomendado por Joel</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA — Instagram de Joel */}
      <div className="py-16 text-center bg-[#0D0D0D] border-t border-white/5">
        <p className="text-white/40 text-sm mb-4">Seguí a Joel</p>
        <a
          href="https://instagram.com/joelllanes_"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-2xl font-[family-name:var(--font-heading)] font-bold text-white hover:text-[#C96442] transition-colors"
        >
          @joelllanes_
        </a>
        <p className="text-white/20 text-xs mt-2">146K seguidores</p>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5">
        <p className="text-white/15 text-xs">
          Parte de{" "}
          <Link href="/" className="hover:text-white/40 transition-colors">
            Brújula Digital
          </Link>
          {" · "}
          <a href="https://kohancampos.com.py" target="_blank" rel="noopener noreferrer" className="hover:text-white/40 transition-colors">
            Kohan &amp; Campos
          </a>
        </p>
      </footer>
    </div>
  );
}
