"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, TrendingUp, Shield, ArrowRight, Users, Search, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHome() {
  const [stats, setStats] = useState({ funcionarios: 0, consultasHoy: 0, consultasMes: 0 });

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("funcionarios").select("*", { count: "exact", head: true }),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]).then(([f, h, m]) => {
      setStats({ funcionarios: f.count ?? 0, consultasHoy: h.count ?? 0, consultasMes: m.count ?? 0 });
    });
  }, []);

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[#1F1E1D]">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1">Todas las herramientas en un solo lugar</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Funcionarios", value: stats.funcionarios, icon: Database, color: "text-[#C96442]" },
          { label: "Consultas hoy", value: stats.consultasHoy, icon: Search, color: "text-[#5A7D5A]" },
          { label: "Este mes", value: stats.consultasMes, icon: TrendingUp, color: "text-[#4A7B9D]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#D4D2C9] p-3 text-center">
            <p className="text-[10px] sm:text-xs text-[#87867F] mb-1">{s.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tools grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { href: "/verificar", icon: ShieldCheck, title: "Verificar Funcionario", desc: "Buscá por CI", color: "bg-[#C96442]/10 text-[#C96442]" },
          { href: "/precios", icon: TrendingUp, title: "Precios DNCP", desc: "Licitaciones adjudicadas", color: "bg-[#5A7D5A]/10 text-[#5A7D5A]" },
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

      {/* Admin links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/clientes" className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#C96442]" />
            <div>
              <p className="font-semibold text-[#1F1E1D]">Gestionar clientes</p>
              <p className="text-xs text-[#87867F]">Ver y asignar módulos</p>
            </div>
          </div>
        </Link>
        <a href="/" className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <ArrowRight className="h-5 w-5 text-[#C96442]" />
            <div>
              <p className="font-semibold text-[#1F1E1D]">Landing pública</p>
              <p className="text-xs text-[#87867F]">Volver al inicio</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
