import Link from "next/link";
import { ShieldCheck, TrendingUp, Search, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

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
          <Link href="/verificar" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold text-base rounded-xl transition-colors">
            Probar ahora <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 border border-[#D4D2C9] text-[#1F1E1D] font-semibold text-base rounded-xl hover:bg-white transition-colors">
            Ingresar
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C96442] mb-3 text-center">Productos disponibles</p>
        <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-10">Dos herramientas. Un solo lugar.</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Module 3 */}
          <Link href="/verificar" className="group bg-white rounded-2xl border border-[#D4D2C9] p-6 hover:shadow-lg hover:border-[#C96442]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#C96442]/10 flex items-center justify-center mb-5">
              <ShieldCheck className="h-6 w-6 text-[#C96442]" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1E1D] mb-2 group-hover:text-[#C96442] transition-colors">
              Verificación de Funcionarios
            </h3>
            <p className="text-sm text-[#5C5B57] leading-relaxed mb-4">
              ¿Esa persona trabaja en el Estado? Ingresá una cédula y enterate en segundos.
            </p>
            <div className="space-y-2 mb-6">
              {["Búsqueda por CI","Resultado instantáneo","Datos oficiales","Gratis 3 consultas/día"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-[#5C5B57]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#5A7D5A]" /> {f}
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-[#C96442] flex items-center gap-1">
              Probar gratis <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Module 2 */}
          <Link href="/precios" className="group bg-white rounded-2xl border border-[#D4D2C9] p-6 hover:shadow-lg hover:border-[#C96442]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#5A7D5A]/10 flex items-center justify-center mb-5">
              <TrendingUp className="h-6 w-6 text-[#5A7D5A]" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1E1D] mb-2 group-hover:text-[#C96442] transition-colors">
              Inteligencia de Precios
            </h3>
            <p className="text-sm text-[#5C5B57] leading-relaxed mb-4">
              ¿A cuánto se adjudicó ese producto? Historial de precios de licitaciones DNCP.
            </p>
            <div className="space-y-2 mb-6">
              {["Búsqueda por producto","Precios min/avg/max","Proveedores reales","Datos de la DNCP"].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-[#5C5B57]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#5A7D5A]" /> {f}
                </div>
              ))}
            </div>
            <span className="text-sm font-semibold text-[#C96442] flex items-center gap-1">
              Probar gratis <ArrowRight className="h-3.5 w-3.5" />
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

      {/* Footer */}
      <footer className="border-t border-[#D4D2C9] py-8 text-center">
        <p className="text-sm text-[#87867F]">
          Brujula · Datos públicos, dirección clara. · Paraguay · 2026
        </p>
      </footer>
    </div>
  );
}
