import Link from "next/link";
import { ShieldCheck, TrendingUp, Search, Zap, ArrowRight, Shield, Star, Activity } from "lucide-react";
import WhatsAppFloat from "@/components/whatsapp-float";
import { HeroSearch } from "@/components/hero-search";

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

        <p className="text-base sm:text-lg text-[#5C5B57] max-w-xl mx-auto leading-relaxed mb-8 px-4">
          Dos herramientas simples para acceder a información pública del Estado paraguayo.
          Sin burocracia, sin ventanillas, sin esperar.
        </p>

        <HeroSearch />

        <div className="flex flex-col sm:flex-row gap-3 justify-center px-4 mt-6">
          <Link href="/buscar" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold text-base rounded-xl transition-colors">
            Buscar ahora <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
          <Link href="/proveedores" className="inline-flex items-center justify-center h-12 px-6 sm:px-8 border border-[#D4D2C9] text-[#1F1E1D] font-semibold text-base rounded-xl hover:bg-white transition-colors">
            Ver proveedores
          </Link>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-white border-y border-[#D4D2C9] py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
          {[
            { n: "700+", label: "Funcionarios" },
            { n: "10+", label: "Fuentes de datos" },
            { n: "2 seg", label: "Resultado" },
            { n: "6", label: "Módulos" },
            { n: "24/7", label: "Disponible" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl sm:text-3xl font-bold text-[#C96442]">{s.n}</p>
              <p className="text-xs text-[#87867F] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C96442] mb-3 text-center">Productos disponibles</p>
        <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-10">Dos herramientas. Un solo lugar.</h2>

        <h2 className="text-2xl font-bold text-[#1F1E1D] text-center mb-10">11 módulos. Un solo ecosistema.</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/verificar", icon: ShieldCheck, label: "Funcionarios" },
            { href: "/precios", icon: TrendingUp, label: "Precios DNCP" },
            { href: "/score", icon: Shield, label: "Empresa Score" },
            { href: "/radar", icon: Activity, label: "Radar" },
            { href: "/check", icon: ShieldCheck, label: "Check" },
            { href: "/eventos", icon: Activity, label: "Eventos" },
            { href: "/fincheck", icon: TrendingUp, label: "FinCheck" },
            { href: "/inmobiliario", icon: Shield, label: "Inmuebles" },
            { href: "/agro", icon: TrendingUp, label: "Agro" },
            { href: "/portal", icon: Activity, label: "Portal PY" },
            { href: "/entidades", icon: Shield, label: "Entidades" },
            { href: "/comparar", icon: Activity, label: "Comparar" },
          ].map(m => (
            <Link key={m.href} href={m.href} className="group bg-white rounded-xl border border-[#D4D2C9] p-3 text-center hover:border-[#C96442]/30 hover:shadow-sm transition-all">
              <m.icon className="h-5 w-5 text-[#C96442] mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-[#5C5B57] group-hover:text-[#1F1E1D]">{m.label}</span>
            </Link>
          ))}
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
        <p className="text-[#87867F] text-center text-sm mb-10">Sin permanencia. Cancelás cuando quieras. <Link href="/precios-plan" className="text-[#C96442] hover:underline">Ver plan completo →</Link></p>
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
      <footer className="border-t border-[#D4D2C9] py-10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider mb-3">Productos</p>
              <div className="space-y-2">
                {[{ label: "Funcionarios", href: "/verificar" },{ label: "Precios", href: "/precios" },{ label: "Empresas", href: "/score" },{ label: "Radar", href: "/radar" },{ label: "Background Check", href: "/check" }].map(l => (
                  <Link key={l.href} href={l.href} className="block text-xs text-[#5C5B57] hover:text-[#C96442]">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider mb-3">Herramientas</p>
              <div className="space-y-2">
                {[{ label: "Buscador", href: "/buscar" },{ label: "Proveedores", href: "/proveedores" },{ label: "Entidades", href: "/entidades" },{ label: "Comparar", href: "/comparar" }].map(l => (
                  <Link key={l.href} href={l.href} className="block text-xs text-[#5C5B57] hover:text-[#C96442]">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider mb-3">App</p>
              <div className="space-y-2">
                {[{ label: "Dashboard", href: "/dashboard" },{ label: "Acerca de", href: "/acerca" },{ label: "API Docs", href: "/api-docs" },{ label: "Ingresar", href: "/login" }].map(l => (
                  <Link key={l.href} href={l.href} className="block text-xs text-[#5C5B57] hover:text-[#C96442]">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider mb-3">Contacto</p>
              <div className="space-y-2">
                <a href="https://wa.me/595982000808" className="block text-xs text-[#5C5B57] hover:text-[#C96442]">WhatsApp</a>
                <a href="/api/export?source=funcionarios" className="block text-xs text-[#C96442] font-medium hover:underline">Exportar datos ↗</a>
              </div>
            </div>
          </div>
          <p className="text-xs text-[#87867F] text-center pt-6 border-t border-[#D4D2C9]">
            Brujula · Datos públicos, dirección clara. · Paraguay · 2026
          </p>
        </div>
        <div className="text-center mt-3">
          <Link href="/acerca" className="text-xs text-[#C96442] hover:underline">Acerca de</Link>
        </div>
      </footer>
    </div>
  );
}
