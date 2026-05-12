import Link from "next/link";
import { ShieldCheck, TrendingUp, Shield, Database, Zap, Search } from "lucide-react";

const modulos = [
  { icon: ShieldCheck, nombre: "Verificación de Funcionarios", ruta: "/verificar", desc: "Consultá si una persona es funcionario público ingresando su cédula de identidad. Datos oficiales, resultado en segundos.", color: "text-[#C96442]", bg: "bg-[#C96442]/10" },
  { icon: TrendingUp, nombre: "Inteligencia de Precios", ruta: "/precios", desc: "Historial de precios adjudicados en licitaciones del Estado. Buscá por producto y ve precios mínimos, promedio y máximos.", color: "text-[#5A7D5A]", bg: "bg-[#5A7D5A]/10" },
  { icon: Shield, nombre: "Empresa Score", ruta: "/score", desc: "Perfil de contrataciones de una empresa con el Estado. KYC por RUC o nombre. Contratos, montos y nivel de actividad.", color: "text-[#4A7B9D]", bg: "bg-[#4A7B9D]/10" },
  { icon: Database, nombre: "Directorio de Proveedores", ruta: "/proveedores", desc: "Listado de empresas que contratan con el Estado paraguayo. Buscá por nombre y accedé a su perfil completo.", color: "text-[#B89B4B]", bg: "bg-[#B89B4B]/10" },
  { icon: Search, nombre: "Buscador Unificado", ruta: "/buscar", desc: "Una sola barra para buscar por CI, RUC, producto o empresa. Brujula te lleva al módulo correcto.", color: "text-[#8B5E7D]", bg: "bg-[#8B5E7D]/10" },
];

export default function AcercaPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-4">Acerca de Brujula</h1>
          <p className="text-[#5C5B57] max-w-md mx-auto leading-relaxed">
            Una plataforma que convierte datos públicos del Estado paraguayo en información útil. Sin burocracia, sin ventanillas.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D4D2C9] p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="h-5 w-5 text-[#C96442]" />
            <h2 className="text-lg font-bold text-[#1F1E1D]">¿Cómo funciona?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {["Accedemos a datos públicos del Estado", "Los procesamos y organizamos", "Vos buscás y decidís"].map((s, i) => (
              <div key={i} className="bg-[#F5F4ED] rounded-xl p-4 text-center">
                <span className="w-7 h-7 rounded-full bg-[#C96442] text-white text-xs font-bold inline-flex items-center justify-center mb-2">{i+1}</span>
                <p className="text-sm text-[#5C5B57]">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-xl font-bold text-[#1F1E1D] mb-6 text-center">Módulos disponibles</h2>
        <div className="space-y-4">
          {modulos.map(m => (
            <Link key={m.ruta} href={m.ruta} className="flex items-start gap-4 bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md hover:border-[#C96442]/30 transition-all group">
              <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <m.icon className={`h-6 w-6 ${m.color}`} />
              </div>
              <div>
                <p className="font-bold text-[#1F1E1D] group-hover:text-[#C96442] transition-colors">{m.nombre}</p>
                <p className="text-sm text-[#5C5B57] leading-relaxed mt-1">{m.desc}</p>
                <p className="text-xs text-[#C96442] font-medium mt-2 group-hover:underline">Probar →</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/" className="text-sm text-[#C96442] font-medium hover:underline">← Volver al inicio</Link>
        </div>
      </section>
    </div>
  );
}
