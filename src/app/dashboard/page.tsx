"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, TrendingUp, Shield, ArrowRight, Activity, Search, Database, Users, ClipboardList, DollarSign, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardHome() {
  const [stats, setStats] = useState({ funcionarios: 0, consultasHoy: 0, consultasMes: 0 });
  const [gestiones, setGestiones] = useState({ total: 0, enProceso: 0, completadas: 0, revenue: 0 });
  const [recent, setRecent] = useState<Array<{ tipo: string; parametro: string; created_at: string }>>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("funcionarios").select("*", { count: "exact", head: true }),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from("consultas").select("tipo,parametro,created_at").order("created_at", { ascending: false }).limit(5),
      supabase.from("gestiones").select("id,estado,precio_cobrado"),
    ]).then(([f, h, m, r, g]) => {
      setStats({ funcionarios: f.count ?? 0, consultasHoy: h.count ?? 0, consultasMes: m.count ?? 0 });
      setRecent(r.data ?? []);
      const gs = g.data ?? [];
      setGestiones({
        total: gs.length,
        enProceso: gs.filter(g => g.estado === "en_proceso" || g.estado === "recibido").length,
        completadas: gs.filter(g => g.estado === "completado").length,
        revenue: gs.reduce((s, g) => s + (g.precio_cobrado || 0), 0),
      });
    });
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold text-[#1F1E1D]">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1">{stats.funcionarios} funcionarios · {stats.consultasMes} consultas este mes</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Funcionarios", value: stats.funcionarios, icon: Database, color: "text-[#C96442]" },
          { label: "Consultas hoy", value: stats.consultasHoy, icon: Search, color: "text-[#5A7D5A]" },
          { label: "Este mes", value: stats.consultasMes, icon: TrendingUp, color: "text-[#4A7B9D]" },
          { label: "Módulos", value: "7", icon: Activity, color: "text-[#B89B4B]" },
          { label: "Activas", value: gestiones.enProceso, icon: ClipboardList, color: "text-[#B89B4B]" },
          { label: "Revenue", value: `Gs ${gestiones.revenue.toLocaleString()}`, icon: DollarSign, color: "text-[#5A7D5A]" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#D4D2C9] p-3 text-center">
            <p className="text-[10px] sm:text-xs text-[#87867F] mb-1">{s.label}</p>
            <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Tools grid */}
        <div>
          <p className="text-sm font-semibold text-[#1F1E1D] mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#C96442]" /> Herramientas
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/verificar", icon: ShieldCheck, label: "Funcionarios", color: "text-[#C96442]" },
              { href: "/precios", icon: TrendingUp, label: "Precios", color: "text-[#5A7D5A]" },
              { href: "/score", icon: Shield, label: "Empresas", color: "text-[#4A7B9D]" },
              { href: "/radar", icon: Activity, label: "Radar", color: "text-[#B89B4B]" },
              { href: "/check", icon: ShieldCheck, label: "Check", color: "text-[#C96442]" },
              { href: "/comparar", icon: Activity, label: "Comparar", color: "text-[#5A7D5A]" },
            ].map(t => (
              <Link key={t.href} href={t.href} className="flex items-center gap-2 bg-white rounded-xl border border-[#D4D2C9] p-2.5 hover:border-[#C96442]/30 hover:shadow-sm transition-all group">
                <t.icon className={`h-4 w-4 ${t.color} shrink-0`} />
                <span className="text-xs font-medium text-[#5C5B57] group-hover:text-[#1F1E1D]">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent queries */}
        <div>
          <p className="text-sm font-semibold text-[#1F1E1D] mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C96442]" /> Actividad reciente
          </p>
          {recent.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#D4D2C9] p-6 text-center text-sm text-[#87867F]">
              Sin consultas todavía
            </div>
          ) : (
            <div className="space-y-1.5">
              {recent.map((r, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-[#C96442] capitalize">{r.tipo}</span>
                    <span className="text-xs text-[#5C5B57] ml-2 font-mono">{r.parametro}</span>
                  </div>
                  <span className="text-[10px] text-[#87867F]">{new Date(r.created_at).toLocaleTimeString("es-PY", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin links */}
      <div className="grid sm:grid-cols-4 gap-3 mt-6">
        {[
          { href: "/dashboard/clientes", icon: Users, label: "Clientes" },
          { href: "/buscar", icon: Search, label: "Buscador" },
          { href: "/status", icon: Activity, label: "Estado" },
          { href: "/", icon: ArrowRight, label: "Landing" },
        ].map(l => (
          <Link key={l.href} href={l.href} className="flex items-center justify-center gap-2 bg-white rounded-xl border border-[#D4D2C9] p-3 hover:bg-[#F5F4ED] transition-colors text-xs font-medium text-[#5C5B57]">
            <l.icon className="h-4 w-4 text-[#C96442]" /> {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
