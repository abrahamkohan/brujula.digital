import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CalendarCheck, AlertTriangle, Wrench, ArrowRight } from "lucide-react";

async function getStats() {
  const supabase = await createClient();

  const { count: totalEventos } = await supabase
    .from("eventos")
    .select("*", { count: "exact", head: true })
    .gte("fecha", new Date().toISOString().split("T")[0]);

  const { data: fuentes } = await supabase
    .from("sources")
    .select("name, categoria, status, last_error, id, active")
    .order("name");

  const conError = fuentes?.filter((f) => f.status === "error") ?? [];
  const manuales = fuentes?.filter((f) => f.status === "manual") ?? [];
  const activas = fuentes?.filter((f) => f.active) ?? [];

  return { totalEventos: totalEventos ?? 0, conError, manuales, activas: activas.length, fuentes: fuentes ?? [] };
}

export default async function AdminDashboardPage() {
  const { totalEventos, conError, manuales, activas, fuentes } = await getStats();
  const alertas = fuentes.filter((f) => f.status === "error" || f.status === "manual");

  const kpis = [
    { label: "Eventos activos", value: totalEventos, icon: CalendarCheck, color: "text-[#C96442]" },
    { label: "Fuentes activas", value: activas, icon: CalendarCheck, color: "text-[#5A7D5A]" },
    { label: "Con error", value: conError.length, icon: AlertTriangle, color: "text-[#C96442]" },
    { label: "Manuales", value: manuales.length, icon: Wrench, color: "text-[#B89B4B]" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1F1E1D] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#87867F] mt-1 font-sans">Panel de administración</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-[#D4D2C9] p-5">
              <Icon className={`h-5 w-5 ${kpi.color} mb-3`} />
              <p className="text-2xl font-bold text-[#1F1E1D] tracking-tight">{kpi.value}</p>
              <p className="text-xs text-[#87867F] mt-1">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Alertas */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[#1F1E1D] mb-3">Alertas</h2>

        {alertas.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D4D2C9] p-6 text-sm text-[#87867F]">
            No hay alertas. Todas las fuentes están bien.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#D4D2C9] overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_1fr_100px] gap-3 px-5 py-3 text-xs font-medium text-[#87867F] border-b border-[#D4D2C9]">
              <span>Fuente</span>
              <span>Categoría</span>
              <span>Estado</span>
              <span>Problema</span>
              <span>Acción</span>
            </div>
            {alertas.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[1fr_100px_80px_1fr_100px] gap-3 px-5 py-3 text-sm border-b border-[#D4D2C9] last:border-0 items-center"
              >
                <span className="font-medium text-[#1F1E1D]">{f.name}</span>
                <span className="text-[#5C5B57]">{f.categoria}</span>
                <span
                  className={`text-xs font-medium ${
                    f.status === "error" ? "text-[#C96442]" : "text-[#B89B4B]"
                  }`}
                >
                  {f.status === "error" ? "Error" : "Manual"}
                </span>
                <span className="text-[#87867F] text-sm truncate">
                  {f.status === "error"
                    ? f.last_error ?? "Error al scrapear"
                    : "Sin eventos esta semana"}
                </span>
                <div>
                  {f.status === "error" ? (
                    <span className="text-[#C96442] text-xs">Ver error</span>
                  ) : (
                    <Link
                      href="/admin/eventos/nuevo"
                      className="text-[#C96442] text-xs hover:underline inline-flex items-center gap-1"
                    >
                      + Evento <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
