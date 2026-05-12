import Link from "next/link";
import { ShieldCheck, TrendingUp, Shield, ArrowRight } from "lucide-react";

export default function DashboardHome() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[#1F1E1D]">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1">Todas las herramientas en un solo lugar</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/verificar", icon: ShieldCheck, title: "Verificar Funcionario", desc: "Buscá por CI", color: "bg-[#C96442]/10 text-[#C96442]" },
          { href: "/precios", icon: TrendingUp, title: "Inteligencia de Precios", desc: "Precios DNCP", color: "bg-[#5A7D5A]/10 text-[#5A7D5A]" },
          { href: "/score", icon: Shield, title: "Empresa Score", desc: "KYC por RUC", color: "bg-[#4A7B9D]/10 text-[#4A7B9D]" },
        ].map(tool => (
          <Link key={tool.href} href={tool.href} className="group bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md hover:border-[#C96442]/30 transition-all">
            <div className={`w-10 h-10 rounded-xl ${tool.color} flex items-center justify-center mb-4`}>
              <tool.icon className="h-5 w-5" />
            </div>
            <p className="font-semibold text-[#1F1E1D] mb-1 group-hover:text-[#C96442] transition-colors">{tool.title}</p>
            <p className="text-xs text-[#87867F]">{tool.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-[#C96442] opacity-0 group-hover:opacity-100 transition-opacity">
              Abrir <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/clientes" className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md transition-shadow">
          <p className="font-semibold text-[#1F1E1D] mb-1">Gestionar clientes</p>
          <p className="text-xs text-[#87867F]">Ver, asignar módulos y monitorear uso</p>
        </Link>
        <Link href="/dashboard/modulos" className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md transition-shadow">
          <p className="font-semibold text-[#1F1E1D] mb-1">Configurar módulos</p>
          <p className="text-xs text-[#87867F]">Precios, descripciones y activación</p>
        </Link>
      </div>
    </div>
  );
}
