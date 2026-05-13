"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Database, Search, TrendingUp, Activity, ShieldCheck, Globe, Zap, Plus, ArrowRight } from "lucide-react";

interface Stats { funcionarios: number; consultasHoy: number; consultasMes: number; modulosActivos: number; fuentesActivas: number; }
interface Activity { tipo: string; parametro: string; created_at: string; }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ funcionarios: 0, consultasHoy: 0, consultasMes: 0, modulosActivos: 11, fuentesActivas: 1 });
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("funcionarios").select("*", { count: "exact", head: true }),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      supabase.from("consultas").select("*", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
      supabase.from("scraper_status").select("estado"),
      supabase.from("consultas").select("tipo,parametro,created_at").order("created_at", { ascending: false }).limit(6),
    ]).then(([f, h, m, src, act]) => {
      const fuentesActivas = (src.data ?? []).filter(s => s.estado === "activa").length;
      setStats({
        funcionarios: f.count ?? 0,
        consultasHoy: h.count ?? 0,
        consultasMes: m.count ?? 0,
        modulosActivos: 11,
        fuentesActivas,
      });
      setActivity(act.data ?? []);
    });
  }, []);

  const kpis = [
    { label: "Funcionarios", value: stats.funcionarios.toLocaleString(), icon: Database, color: "text-[#C96442]" },
    { label: "Consultas hoy", value: stats.consultasHoy, icon: Search, color: "text-[#5A7D5A]" },
    { label: "Consultas este mes", value: stats.consultasMes, icon: TrendingUp, color: "text-[#4A7B9D]" },
    { label: "Módulos activos", value: stats.modulosActivos, icon: ShieldCheck, color: "text-[#B89B4B]" },
    { label: "Fuentes activas", value: `${stats.fuentesActivas}/3`, icon: Globe, color: "text-[#8B5E7D]" },
  ];

  const systemStatus: Array<{ name: string; status: "online" | "warning" | "offline" }> = [
    { name: "DNCP API", status: "online" as const },
    { name: "Supabase", status: "online" as const },
    { name: "Scraping SFP", status: "offline" as const },
    { name: "Vercel", status: "online" as const },
  ];

  const quickActions = [
    { label: "Nueva búsqueda", href: "/buscar", icon: Search },
    { label: "Verificar CI", href: "/verificar", icon: ShieldCheck },
    { label: "Nueva gestión", href: "/dashboard/gestiones", icon: Plus },
  ];

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-[#1F1E1D] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1">Resumen operativo de Brujula</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-12">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#D4D2C9] p-5 hover:shadow-sm transition-shadow">
            <kpi.icon className={`h-5 w-5 ${kpi.color} mb-3`} />
            <p className="text-2xl sm:text-3xl font-bold text-[#1F1E1D] tracking-tight">{kpi.value}</p>
            <p className="text-xs text-[#87867F] mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mb-12">
        {/* Activity */}
        <div>
          <h2 className="text-sm font-semibold text-[#1F1E1D] mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#C96442]" /> Actividad reciente
          </h2>
          {activity.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D4D2C9] p-8 text-center text-sm text-[#87867F]">
              Sin actividad registrada
            </div>
          ) : (
            <div className="space-y-1">
              {activity.map((a, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C96442] shrink-0" />
                    <span className="text-xs text-[#5C5B57] capitalize">{a.tipo}</span>
                    <span className="text-xs text-[#87867F] font-mono truncate">{a.parametro}</span>
                  </div>
                  <span className="text-[10px] text-[#87867F] shrink-0 ml-3">
                    {new Date(a.created_at).toLocaleTimeString("es-PY", { hour:"2-digit", minute:"2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System status + Quick actions */}
        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold text-[#1F1E1D] mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#C96442]" /> Estado del sistema
            </h2>
            <div className="bg-white rounded-2xl border border-[#D4D2C9] divide-y divide-[#F5F4ED]">
              {systemStatus.map(s => (
                <div key={s.name} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-[#5C5B57]">{s.name}</span>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    s.status === "online" ? "text-[#5A7D5A]" : s.status === "warning" ? "text-[#B89B4B]" : "text-[#87867F]"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${s.status === "online" ? "bg-[#5A7D5A]" : s.status === "warning" ? "bg-[#B89B4B]" : "bg-[#D4D2C9]"}`} />
                    {s.status === "online" ? "Online" : s.status === "warning" ? "Degradado" : "Offline"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#1F1E1D] mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-3 gap-2">
              {quickActions.map(a => (
                <a key={a.label} href={a.href} className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-[#D4D2C9] p-4 hover:border-[#C96442]/30 hover:shadow-sm transition-all group text-center">
                  <a.icon className="h-4 w-4 text-[#C96442] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium text-[#5C5B57] group-hover:text-[#1F1E1D]">{a.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
