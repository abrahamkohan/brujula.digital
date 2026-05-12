import Link from "next/link";
import { ShieldCheck, TrendingUp, Search, Zap, ArrowRight, Shield, Star, Package } from "lucide-react";
import { WhatsAppFloat } from "@/components/whatsapp-float";

const planes = [
  { nombre: "Starter", modulos: "1 módulo", precio: "USD 30–80/mes", tag: "Entrada", features: ["1 módulo a elección","Consultas ilimitadas","Soporte por email"] },
  { nombre: "Pro", modulos: "2–3 módulos", precio: "USD 100–200/mes", tag: "Volumen", features: ["2-3 módulos combinados","API acceso básico","Dashboard avanzado","Soporte prioritario"] },
  { nombre: "Full", modulos: "Todos", precio: "USD 300–500/mes", tag: "All-in", features: ["Todos los módulos","API completa","Múltiples usuarios","Soporte WhatsApp","SLA garantizado"] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-xs px-4 py-1.5 rounded-full mb-8 font-medium tracking-widest uppercase">
          Datos públicos · Paraguay
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#1F1E1D] leading-tight mb-6">
          Los datos del Estado,<br />
          <span className="text-[#C96442]">cuando vos los necesitás.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#5C5B57] max-w-xl mx-auto leading-relaxed mb-10 px-4">
          Dos herramientas simples para acceder a información pública del Estado paraguayo.
          Sin burocracia, sin ventanillas, sin esperar.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
          <Link href="/buscar" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold text-base rounded-xl transition-colors">
            Buscar ahora <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/proveedores" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 border border-[#D4D2C9] text-[#1F1E1D] font-semibold text-base rounded-xl hover:bg-white transition-colors">
            Ver proveedores
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C96442] mb-3 text-center">Productos disponibles</p>
        <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-10">Dos herramientas. Un solo lugar.</h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {/* Módulo 3 */}
          <Link href="/verificar" className="group bg-white rounded-2xl border border-[#D4D2C9] p-6 hover:shadow-lg hover:border-[#C96442]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#C96442]/10 flex items-center justify-center mb-5">
              <ShieldCheck className="h-6 w-6 text-[#C96442]" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1E1D] mb-2 group-hover:text-[#C96442] transition-colors">
              Verificación
            </h3>
            <p className="text-sm text-[#5C5B57] leading-relaxed mb-4">
              ¿Es funcionario público? Ingresá una CI y enterate en segundos.
            </p>
            <span className="text-sm font-semibold text-[#C96442] flex items-center gap-1">
              Probar <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Módulo 2 */}
          <Link href="/precios" className="group bg-white rounded-2xl border border-[#D4D2C9] p-6 hover:shadow-lg hover:border-[#C96442]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#5A7D5A]/10 flex items-center justify-center mb-5">
              <TrendingUp className="h-6 w-6 text-[#5A7D5A]" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1E1D] mb-2 group-hover:text-[#C96442] transition-colors">
              Precios DNCP
            </h3>
            <p className="text-sm text-[#5C5B57] leading-relaxed mb-4">
              Historial de precios adjudicados en licitaciones del Estado.
            </p>
            <span className="text-sm font-semibold text-[#C96442] flex items-center gap-1">
              Probar <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Módulo 1 — NUEVO */}
          <Link href="/score" className="group bg-white rounded-2xl border border-[#D4D2C9] p-6 hover:shadow-lg hover:border-[#C96442]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#4A7B9D]/10 flex items-center justify-center mb-5">
              <Shield className="h-6 w-6 text-[#4A7B9D]" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1E1D] mb-2 group-hover:text-[#C96442] transition-colors">
              Empresa Score
            </h3>
            <p className="text-sm text-[#5C5B57] leading-relaxed mb-4">
              Perfil de contrataciones de una empresa por RUC. KYC en segundos.
            </p>
            <span className="text-sm font-semibold text-[#C96442] flex items-center gap-1">
              Probar <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-[#D4D2C9] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C96442] mb-3 text-center">Así de simple</p>
          <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-12">Buscás. Encontrás. Decidís.</h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Ingresá un dato", desc: "Cédula de identidad o nombre de producto.", icon: Search },
              { step: "2", title: "Consultá al instante", desc: "Cruzamos fuentes oficiales en segundos.", icon: Zap },
              { step: "3", title: "Tomá una decisión", desc: "Con información real, sin intermediarios.", icon: ShieldCheck },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F4ED] flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-6 w-6 text-[#C96442]" />
                </div>
                <div className="w-7 h-7 rounded-full bg-[#C96442] text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <p className="font-bold text-[#1F1E1D] mb-1">{s.title}</p>
                <p className="text-sm text-[#5C5B57]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C96442] mb-3 text-center">Planes</p>
        <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-2">Pagás solo por lo que usás</h2>
        <p className="text-[#87867F] text-center text-sm mb-10">Sin permanencia. Cancelás cuando quieras.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {planes.map(p => (
            <div key={p.nombre} className="bg-white rounded-2xl border-2 border-[#D4D2C9] p-6 flex flex-col hover:border-[#C96442]/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-[#1F1E1D] text-lg">{p.nombre}</span>
                <span className="text-xs bg-[#F5F4ED] text-[#87867F] px-2 py-0.5 rounded-full border border-[#D4D2C9]">{p.tag}</span>
              </div>
              <p className="text-xs text-[#87867F] mb-4">{p.modulos}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-[#5C5B57]">
                    <Star className="h-3 w-3 text-[#C96442] shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <p className="text-lg font-bold text-[#C96442] pt-3 border-t border-[#E5E4DD]">{p.precio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-[#1F1E1D] mb-4">
          Probá gratis. Sin registrarte.
        </h2>
        <p className="text-[#5C5B57] mb-8">
          3 consultas por día. Sin costo. Sin tarjeta.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/verificar" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold text-base rounded-xl transition-colors">
            Verificar funcionario <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/precios" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 border border-[#D4D2C9] text-[#1F1E1D] font-semibold text-base rounded-xl hover:bg-white transition-colors">
            Buscar precios <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </section>

      <WhatsAppFloat />

      {/* Footer */}
      <footer className="border-t border-[#D4D2C9] py-8 text-center space-y-2">
        <p className="text-sm text-[#87867F]">
          Brujula · Datos públicos, dirección clara. · Paraguay · 2026
        </p>
        <Link href="/acerca" className="text-xs text-[#C96442] hover:underline">Acerca de</Link>
      </footer>
    </div>
  );
}
