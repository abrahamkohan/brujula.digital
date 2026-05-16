import Link from "next/link";
import { Compass, Clock, MapPin, Ticket, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Escapadas desde Asunción — Brújula Digital",
  description: "Los mejores destinos para un día de campo, aventura o cultura a menos de 2 horas de Asunción. Precios, horarios y tips para cada escapada.",
};

interface EscapadaItem {
  nombre: string;
  ubicacion: string;
  distancia: string;
  descripcion: string;
  precio: string;
  tags: string[];
  requiereReserva: boolean;
  zonaId: string | null;
  mapsUrl: string | null;
  imagen?: string;
}

interface CategoriaEscapada {
  categoria: string;
  items: EscapadaItem[];
}

const ESCAPADAS: CategoriaEscapada[] = [
  {
    categoria: "Día de Campo Familiar",
    items: [
      {
        nombre: "Papalo Resort",
        ubicacion: "Altos",
        distancia: "45 min desde Asunción",
        descripcion: "Complejo familiar de primer nivel con piscinas, paseos a caballo, canchas deportivas, minizoológico y parrillada dominguera.",
        precio: "G. 250.000 adultos · G. 120.000 menores",
        tags: ["Piscinas", "Caballos", "Zoológico"],
        requiereReserva: true,
        zonaId: "altos",
        mapsUrl: "https://maps.google.com/?q=Papalo+Resort+Altos+Paraguay",
      },
      {
        nombre: "Rancho 7",
        ubicacion: "Nueva Colombia",
        distancia: "1h desde Asunción",
        descripcion: "Bosque natural con senderos para avistar monos nativos, lagos artificiales para kayak y ambiente de relax total.",
        precio: "G. 50.000 por persona",
        tags: ["Kayak", "Monos", "Naturaleza"],
        requiereReserva: false,
        zonaId: null,
        mapsUrl: "https://maps.google.com/?q=Rancho+7+Nueva+Colombia+Paraguay",
      },
    ],
  },
  {
    categoria: "Cultura y Lago",
    items: [
      {
        nombre: "Areguá",
        ubicacion: "Areguá",
        distancia: "30 min desde Asunción",
        descripcion: "Arquitectura colonial, ferias de cerámica artesanal, expo-frutillas y los cerros Kõi y Chororĩ con formaciones geológicas únicas.",
        precio: "Entrada libre",
        tags: ["Artesanías", "Historia", "Lago Ypacaraí"],
        requiereReserva: false,
        zonaId: "aregua",
        mapsUrl: null,
      },
      {
        nombre: "San Bernardino",
        ubicacion: "San Bernardino",
        distancia: "40 min desde Asunción",
        descripcion: "El rincón veraniego histórico del Paraguay. Costanera, zona gastronómica moderna y casco histórico de origen alemán.",
        precio: "Entrada libre",
        tags: ["Lago", "Gastronomía", "Casco histórico"],
        requiereReserva: false,
        zonaId: "san-bernardino",
        mapsUrl: null,
      },
    ],
  },
  {
    categoria: "Aventura y Naturaleza",
    items: [
      {
        nombre: "Eco Reserva Mbatoví",
        ubicacion: "Paraguarí",
        distancia: "1h 20min desde Asunción",
        descripcion: "El parque de eco-aventura más famoso del país. Circuito guiado de 3hs con puentes colgantes, tirolesas y rápel en la serranía.",
        precio: "G. 150.000 por persona · Apto desde 6 años",
        tags: ["Tirolesa", "Rápel", "Puentes colgantes"],
        requiereReserva: true,
        zonaId: "paraguari",
        mapsUrl: "https://maps.google.com/?q=Eco+Reserva+Mbatovi+Paraguari",
      },
      {
        nombre: "Parque Nacional Ybycuí",
        ubicacion: "Ybycuí",
        distancia: "2h desde Asunción",
        descripcion: "Saltos de agua cristalinos como el Salto Mina y las ruinas de La Rosada, la primera fundición de hierro de Sudamérica.",
        precio: "G. 20.000 adultos · G. 15.000 vehículo · Abre 08:00–18:00",
        tags: ["Saltos de agua", "Senderismo", "Ruinas históricas"],
        requiereReserva: false,
        zonaId: "ybycui",
        mapsUrl: "https://maps.google.com/?q=Parque+Nacional+Ybycui+Paraguay",
      },
    ],
  },
];

const GRADIENTS = [
  "from-emerald-700 to-teal-600",
  "from-indigo-700 to-purple-600",
  "from-amber-700 to-orange-600",
];

export default function EscapadasPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <div className="bg-[#1F1E1D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Escapadas desde Asunción
          </h1>
          <p className="text-[#B8B7B2] mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Los mejores destinos para un día de campo, aventura o cultura a menos de 2 horas.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {ESCAPADAS.map((cat, cIdx) => (
          <section key={cat.categoria}>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRADIENTS[cIdx]} flex items-center justify-center text-white`}>
                <Compass className="h-5 w-5" />
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight">
                {cat.categoria}
              </h2>
              <div className="flex-1 h-px bg-[#D4D2C9]/50" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <div key={item.nombre} className="bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Imagen / Gradiente */}
                  <div className={`aspect-[16/9] bg-gradient-to-br ${GRADIENTS[cIdx]} relative`}>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {item.distancia}
                      </span>
                    </div>
                    {item.requiereReserva && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C96442] text-white">
                        Reserva previa
                      </span>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center text-white/20">
                      <Compass className="h-16 w-16" />
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#1F1E1D]">{item.nombre}</h3>
                      <p className="text-xs text-[#87867F] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {item.ubicacion}
                      </p>
                    </div>

                    <p className="text-xs text-[#5C5B57] leading-relaxed">{item.descripcion}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F4ED] text-[#5C5B57] border border-[#D4D2C9]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Precio */}
                    <div className="text-xs font-semibold text-[#2D4A2D] flex items-center gap-1">
                      <Ticket className="h-3 w-3" />
                      {item.precio}
                    </div>

                    {/* Botones */}
                    <div className="flex items-center gap-2 pt-1">
                      {item.zonaId && (
                        <Link
                          href={`/zona/${item.zonaId}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#C96442] hover:underline"
                        >
                          Ver guía completa <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                      {item.mapsUrl && (
                        <a
                          href={item.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#5C5B57] hover:text-[#C96442] transition-colors"
                        >
                          <MapPin className="h-3 w-3" /> Ver en Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
