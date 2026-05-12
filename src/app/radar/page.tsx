"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, FileText, CheckCircle2, FileCheck, Loader2, TrendingUp, Building2, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

interface Evento {
  ocid: string; tipo: string; fecha: string; tags: string[]; url: string;
}

export default function RadarPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [stats, setStats] = useState({ licitaciones: 0, adjudicaciones: 0, contratos: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  async function cargar(tipo: string) {
    setLoading(true); setFiltro(tipo);
    try {
      const res = await fetch(`/api/radar?tipo=${tipo}`);
      const json = await res.json();
      setEventos(json.eventos || []);
      setStats(json.stats || {});
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar("todos"); }, []);

  const tipoConfig: Record<string, { label: string; icon: typeof Activity; color: string }> = {
    licitacion: { label: "Licitación", icon: FileText, color: "bg-blue-50 text-blue-600 border-blue-200" },
    adjudicacion: { label: "Adjudicación", icon: CheckCircle2, color: "bg-[#5A7D5A]/10 text-[#5A7D5A] border-[#5A7D5A]/20" },
    contrato: { label: "Contrato", icon: FileCheck, color: "bg-amber-50 text-amber-600 border-amber-200" },
    actividad: { label: "Actividad", icon: Activity, color: "bg-gray-50 text-gray-600 border-gray-200" },
  };

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 font-medium">
            <Activity className="h-3.5 w-3.5 text-[#C96442]" /> Monitoreo en tiempo real
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">Radar de Actividad</h1>
          <p className="text-[#5C5B57] max-w-md mx-auto">Qué está pasando en las contrataciones públicas. Licitaciones, adjudicaciones y contratos.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-[#C96442]" },
            { label: "Licitaciones", value: stats.licitaciones, color: "text-blue-600" },
            { label: "Adjudicadas", value: stats.adjudicaciones, color: "text-[#5A7D5A]" },
            { label: "Contratos", value: stats.contratos, color: "text-amber-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-[#D4D2C9] p-3 text-center">
              <p className="text-[10px] sm:text-xs text-[#87867F] mb-1">{s.label}</p>
              <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "todos", label: "Todo" },
            { id: "licitaciones", label: "Licitaciones" },
            { id: "adjudicaciones", label: "Adjudicaciones" },
          ].map(f => (
            <button key={f.id} onClick={() => cargar(f.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filtro === f.id ? "bg-[#C96442] text-white" : "bg-white text-[#5C5B57] border border-[#D4D2C9] hover:bg-[#F5F4ED]"
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Events */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#C96442]" /></div>
        ) : eventos.length === 0 ? (
          <Card className="border-[#D4D2C9]"><CardContent className="pt-8 pb-8 text-center text-[#87867F]">Sin actividad reciente</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {eventos.map((e, i) => {
              const cfg = tipoConfig[e.tipo] || tipoConfig.actividad;
              const Icon = cfg.icon;
              return (
                <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${cfg.color.split(" ")[0]} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${cfg.color} border text-[10px] px-1.5 py-0`}>{cfg.label}</Badge>
                        <span className="text-xs text-[#87867F]">{e.fecha?.slice(0, 10)}</span>
                      </div>
                      <p className="text-sm text-[#5C5B57] font-mono text-xs truncate">{e.ocid}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {e.tags.map((t, j) => (
                          <span key={j} className="text-[10px] text-[#87867F] bg-[#F5F4ED] px-1.5 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    {e.url && (
                      <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C96442] hover:underline shrink-0 mt-1">Ver ↗</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
