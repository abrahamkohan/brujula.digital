import Link from "next/link";
import {
  Smartphone, Car, Bus, Clock, AlertCircle,
  ArrowRight, ExternalLink, MapPin,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo llegar desde el Aeropuerto — Brújula Digital",
  description:
    "Guía de transporte desde el Aeropuerto Internacional Silvio Pettirossi a los barrios de Asunción. Uber, Bolt, taxi y colectivo con precios actualizados.",
};

const PRECIOS = [
  {
    zona: "Carmelitas / Eje Corporativo",
    tiempo: "15–20 min",
    precio: "Gs. 35.000–45.000",
    usd: "~USD 5–6",
    nota: "La más cercana al aeropuerto",
    destacada: true,
  },
  {
    zona: "Villa Morra",
    tiempo: "20–25 min",
    precio: "Gs. 45.000–60.000",
    usd: "~USD 6–8",
    nota: "",
    destacada: false,
  },
  {
    zona: "Las Mercedes",
    tiempo: "25–30 min",
    precio: "Gs. 55.000–70.000",
    usd: "~USD 7–9",
    nota: "",
    destacada: false,
  },
  {
    zona: "Centro Histórico",
    tiempo: "40–50 min",
    precio: "Gs. 65.000–85.000",
    usd: "~USD 9–11",
    nota: "Hasta 80 min en hora pico",
    destacada: false,
  },
];

const TRANSFERS = [
  {
    name: "Aeromóvil Asunción",
    desc: "Traslados ejecutivos puerta a puerta desde el aeropuerto hacia hoteles.",
    url: null,
  },
  {
    name: "Vamos Tour Paraguay",
    desc: "Logística corporativa y grupal en camionetas de alta gama o minibuses.",
    url: null,
  },
  {
    name: "Teletrans",
    desc: "Transporte de lujo con chofer bilingüe en Asunción.",
    url: null,
  },
  {
    name: "Welcome Pickups",
    desc: "Reservá online con tarifa fija en USD antes de tu vuelo.",
    url: "https://welcomepickups.com",
  },
];

export default function ComoLlegarPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED]">
      {/* Hero */}
      <div className="bg-[#1F1E1D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[#87867F] text-sm hover:text-white transition-colors mb-4"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Inicio
          </Link>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl font-bold text-white tracking-tight">
            ¿Cómo llegar desde{" "}
            <span className="text-[#C96442] italic">el aeropuerto</span>?
          </h1>
          <p className="text-[#B8B7B2] mt-3 text-base sm:text-lg max-w-xl">
            Aeropuerto Internacional Silvio Pettirossi — Luque, Paraguay
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Opciones de transporte */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight mb-5">
            Opciones de transporte
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Uber */}
            <div className="bg-white rounded-2xl border-2 border-[#C96442]/30 p-5 space-y-3 relative">
              <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[#C96442] bg-[#C96442]/10 px-2 py-0.5 rounded-full">
                Recomendado
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#1F1E1D] flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F1E1D]">Uber</h3>
                <p className="text-sm text-[#5C5B57] mt-1">
                  Funciona dentro de la terminal. La opción más económica y cómoda. Pedí antes de salir de la sala de llegadas.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href="https://play.google.com/store/apps/details?id=com.ubercab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  Google Play <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://apps.apple.com/app/uber/id368677368" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  App Store <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Bolt */}
            <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F4ED] flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-[#5C5B57]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F1E1D]">Bolt</h3>
                <p className="text-sm text-[#5C5B57] mt-1">
                  Competencia local de Uber, a veces más barato. También disponible en la terminal.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href="https://play.google.com/store/apps/details?id=ee.mtakso.client" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  Google Play <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://apps.apple.com/app/bolt/id675033630" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  App Store <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* MUV */}
            <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F4ED] flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-[#5C5B57]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F1E1D]">MUV</h3>
                <p className="text-sm text-[#5C5B57] mt-1">
                  App paraguaya de movilidad. Suele tener buenos precios y disponibilidad en la zona del aeropuerto.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a href="https://play.google.com/store/apps/details?id=py.com.muv" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  Google Play <ExternalLink className="h-3 w-3" />
                </a>
                <a href="https://apps.apple.com/app/muv-paraguay/id6730000000" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F1E1D] text-white text-xs font-semibold hover:bg-[#C96442] transition-colors">
                  App Store <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Taxi */}
            <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F4ED] flex items-center justify-center">
                <Car className="h-5 w-5 text-[#5C5B57]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F1E1D]">Taxi oficial</h3>
                <p className="text-sm text-[#5C5B57] mt-1">
                  Parada regulada a la salida de la terminal. Opera las 24hs. Tarifa fija, significativamente más cara que las apps. Conveniente si no tenés datos móviles.
                </p>
              </div>
            </div>

            {/* Línea 30 */}
            <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5F4ED] flex items-center justify-center">
                <Bus className="h-5 w-5 text-[#5C5B57]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F1E1D]">Línea 30</h3>
                <p className="text-sm text-[#5C5B57] mt-1">
                  Sale frente a la terminal. Directo por Av. Aviadores del Chaco hasta delSol Shopping y Paseo La Galería. Muy económico, menos cómodo con equipaje.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabla de precios */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight mb-5">
            Precios y tiempos por zona
          </h2>
          <p className="text-sm text-[#87867F] mb-4">
            Precios estimados para Uber / Bolt en condiciones normales.
          </p>

          <div className="bg-white rounded-2xl border border-[#D4D2C9] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 gap-0 bg-[#F5F4ED] border-b border-[#D4D2C9] px-5 py-3">
              <span className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">Zona</span>
              <span className="text-xs font-semibold text-[#87867F] uppercase tracking-wider flex items-center gap-1"><Clock className="h-3 w-3" /> Tiempo</span>
              <span className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">Guaraníes</span>
              <span className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">USD aprox.</span>
            </div>

            {PRECIOS.map((p, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 gap-0 px-5 py-4 border-b border-[#D4D2C9]/50 last:border-0 ${p.destacada ? "bg-[#C96442]/5" : ""}`}
              >
                <div>
                  <p className={`text-sm font-semibold ${p.destacada ? "text-[#C96442]" : "text-[#1F1E1D]"}`}>
                    {p.zona}
                  </p>
                  {p.nota && (
                    <p className="text-xs text-[#87867F] mt-0.5">{p.nota}</p>
                  )}
                </div>
                <span className="text-sm text-[#5C5B57] self-center">{p.tiempo}</span>
                <span className="text-sm text-[#5C5B57] self-center">{p.precio}</span>
                <span className="text-sm font-medium text-[#1F1E1D] self-center">{p.usd}</span>
              </div>
            ))}
          </div>

          {/* Alerta pico */}
          <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Hora pico:</strong> lunes a viernes de 07:00–09:00 y 17:00–19:30, y con lluvia intensa, las tarifas pueden duplicarse o triplicarse. Si llegás en ese horario, considerá esperar en el aeropuerto 30–40 minutos.
            </p>
          </div>
        </section>

        {/* Transfer privado */}
        <section>
          <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-bold text-[#1F1E1D] tracking-tight mb-2">
            Transfer privado
          </h2>
          <p className="text-sm text-[#87867F] mb-5">
            Si querés que un chofer te espere con tu nombre en el cartel, estas empresas operan desde el aeropuerto.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRANSFERS.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-[#D4D2C9] p-4 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-[#F5F4ED] flex items-center justify-center shrink-0">
                  <Car className="h-4 w-4 text-[#5C5B57]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-[#1F1E1D]">{t.name}</h3>
                    {t.url && (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C96442] hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-[#87867F] mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Desde el aeropuerto, ¿dónde quedarse? */}
        <section className="border-t border-[#D4D2C9]/50 pt-10">
          <p className="text-sm text-[#87867F] mb-2">¿Ya resolviste el transporte?</p>
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#1F1E1D] tracking-tight mb-4">
            Ahora buscá dónde quedarte
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { id: "carmelitas", label: "Carmelitas", dist: "15–20 min" },
              { id: "villa-morra", label: "Villa Morra", dist: "20–25 min" },
              { id: "centro", label: "Centro Histórico", dist: "40–50 min" },
            ].map((z) => (
              <Link
                key={z.id}
                href={`/zona/${z.id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D4D2C9] rounded-xl hover:border-[#C96442]/40 hover:shadow-sm transition-all group"
              >
                <MapPin className="h-3.5 w-3.5 text-[#C96442]" />
                <span className="text-sm font-medium text-[#1F1E1D]">{z.label}</span>
                <span className="text-xs text-[#87867F]">{z.dist}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#D4D2C9] group-hover:text-[#C96442] transition-colors" />
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
