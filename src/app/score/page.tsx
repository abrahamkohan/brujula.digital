"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, Loader2, AlertCircle, TrendingUp, FileText, Activity, AlertTriangle, Building2, DollarSign } from "lucide-react";
import Link from "next/link";

interface Contrato {
  fecha: string; entidad: string; monto: number; moneda: string; ocid: string; items: string[];
}

interface EmpresaScore {
  ruc: string; nombre: string; categorias: string[]; sanciones: string[];
  total_adjudicado: number; contratos_total: number; contratos_12m: number; nivel_actividad: string;
  contratos: Contrato[];
}

function fmtGs(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} MM`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} k`;
  return `${n}`;
}

export default function ScorePage() {
  const [ruc, setRuc] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EmpresaScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buscar() {
    setError(null); setData(null); setLoading(true);
    try {
      const isRuc = /^\d/.test(ruc) && ruc.replace(/\D/g, "").length >= 6;
      const params = isRuc ? `ruc=${ruc}` : `name=${encodeURIComponent(ruc)}`;
      const res = await fetch(`/api/empresa-score?${params}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error);
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al consultar");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 font-medium">
          <Shield className="h-3.5 w-3.5 text-[#C96442]" /> KYC · Due Diligence · Contrataciones
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3 sm:mb-4">Empresa Score</h1>
        <p className="text-base sm:text-lg text-[#5C5B57] max-w-md mx-auto leading-relaxed">
          Perfil completo de contrataciones con el Estado. Por RUC.
        </p>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="RUC: 80012345-7 o nombre de empresa" value={ruc}
                onChange={(e) => setRuc(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ruc.length >= 3 && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1" autoFocus />
              <Button onClick={buscar} disabled={loading || ruc.length < 3}
                className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-xs text-[#87867F] text-center">Ejemplos: 80012345-7 · CQ Emprendimientos · HIDRAULICA PARAGUAYA</p>
            {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}

            {data && (
              <div className="space-y-4 pt-2">
                {/* Header */}
                <div className="bg-[#F5F4ED] rounded-2xl p-5">
                  <p className="text-xs text-[#87867F] uppercase tracking-wider mb-1">Empresa</p>
                  <p className="text-xl font-bold text-[#1F1E1D]">{data.nombre}</p>
                  <p className="text-sm text-[#5C5B57] mt-1">RUC {data.ruc}</p>
                  {data.categorias.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {data.categorias.map((c, i) => <Badge key={i} className="bg-white text-[#5C5B57] hover:bg-white border-0 text-xs">{c}</Badge>)}
                    </div>
                  )}
                  {data.sanciones.length > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-2"><AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div><p className="text-xs font-semibold text-amber-900">Sanciones</p>
                          {data.sanciones.map((s, i) => <p key={i} className="text-xs text-amber-800">{s}</p>)}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Total adjudicado", value: fmtGs(data.total_adjudicado)+" Gs", icon: DollarSign, color: "text-[#C96442]" },
                    { label: "Contratos", value: data.contratos_total, icon: FileText, color: "text-[#4A7B9D]" },
                    { label: "Últ. 12 meses", value: data.contratos_12m, icon: TrendingUp, color: "text-[#5A7D5A]" },
                    { label: "Actividad", value: data.nivel_actividad, icon: Activity, color: data.nivel_actividad === "Alto" ? "text-[#5A7D5A]" : data.nivel_actividad === "Medio" ? "text-[#B89B4B]" : "text-[#87867F]" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#D4D2C9] p-3 text-center">
                      <p className="text-[10px] sm:text-xs text-[#87867F] mb-1">{s.label}</p>
                      <p className={`text-base sm:text-lg font-bold ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Contracts */}
                {data.contratos.length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">Contratos recientes</p>
                    {data.contratos.map((c, i) => (
                      <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0"><Building2 className="h-3 w-3 text-[#87867F] inline mr-1" />
                            <span className="text-xs text-[#5C5B57]">{c.entidad}</span>
                            <p className="text-xs text-[#87867F] mt-0.5">{c.fecha?.slice(0,10)}</p>
                          </div>
                          <span className="text-sm font-bold text-[#C96442] shrink-0">{fmtGs(c.monto)} Gs</span>
                        </div>
                        {c.items.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.items.slice(0,4).map((item, j) => (
                              <span key={j} className="text-[10px] text-[#87867F] bg-[#F5F4ED] px-2 py-0.5 rounded-full truncate max-w-[180px]">{item}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
