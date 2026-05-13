import Link from "next/link";
import { CheckCircle2, Star, Zap, ArrowRight } from "lucide-react";

const planes = [
  { nombre: "Starter", precio: "USD 30–80", periodo: "/mes", tag: "1 módulo", destacado: false,
    features: ["1 módulo a elección","Consultas ilimitadas","Soporte por email","Acceso web y API","Sin permanencia"],
    cta: "Empezar gratis", href: "/buscar" },
  { nombre: "Pro", precio: "USD 100–200", periodo: "/mes", tag: "2-3 módulos", destacado: true,
    features: ["2-3 módulos combinados","API acceso básico","Dashboard avanzado","Soporte prioritario","Exportación de datos","Sin permanencia"],
    cta: "Empezar prueba", href: "/buscar" },
  { nombre: "Full", precio: "USD 300–500", periodo: "/mes", tag: "Todos los módulos", destacado: false,
    features: ["Todos los módulos","API completa","Múltiples usuarios","Soporte WhatsApp","SLA garantizado","Personalización","Sin permanencia"],
    cta: "Contactar", href: "https://wa.me/595982000808" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
            <Star className="h-3.5 w-3.5 text-[#C96442]" /> Planes simples
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-4">Pagá solo por lo que usás</h1>
          <p className="text-[#5C5B57] max-w-md mx-auto">Sin costos ocultos. Sin permanencia. Cancelás cuando quieras.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {planes.map(p => (
            <div key={p.nombre} className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 flex flex-col ${p.destacado ? "border-[#C96442] shadow-lg scale-[1.02]" : "border-[#D4D2C9]"}`}>
              {p.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C96442] text-white text-xs font-bold px-4 py-1 rounded-full">Más popular</div>
              )}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#1F1E1D] text-xl">{p.nombre}</span>
                  <span className="text-xs bg-[#F5F4ED] text-[#87867F] px-2 py-0.5 rounded-full">{p.tag}</span>
                </div>
                <p className="text-3xl font-bold text-[#C96442]">{p.precio}<span className="text-sm font-normal text-[#87867F]">{p.periodo}</span></p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#5C5B57]">
                    <CheckCircle2 className="h-4 w-4 text-[#5A7D5A] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`w-full inline-flex items-center justify-center h-12 rounded-xl font-semibold text-sm transition-colors ${
                p.destacado ? "bg-[#C96442] hover:bg-[#B5583A] text-white" : "border-2 border-[#D4D2C9] text-[#1F1E1D] hover:bg-[#F5F4ED]"
              }`}>
                {p.cta} <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#D4D2C9] p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Zap className="h-5 w-5 text-[#C96442]" />
            <h2 className="text-lg font-bold text-[#1F1E1D]">¿Necesitás algo a medida?</h2>
          </div>
          <p className="text-sm text-[#5C5B57] mb-4">Plan Enterprise con clientes ilimitados, API dedicada y SLA.</p>
          <a href="https://wa.me/595982000808" className="inline-flex items-center gap-2 text-sm font-semibold text-[#C96442] hover:underline">
            Hablar por WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
