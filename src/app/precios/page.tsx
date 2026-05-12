"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Loader2, Building2, User, Calendar, PackageOpen } from "lucide-react";

interface Award {
  ocid: string;
  title: string;
  entity: string;
  supplier: string;
  amount: number;
  currency: string;
  date: string;
  dncp_url?: string;
  items: string[];
}

interface Stats {
  min: number;
  max: number;
  avg: number;
  count: number;
  currency: string;
}

function fmtGs(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} MM`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)} k`;
  return `${n}`;
}

export default function PreciosPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("2025");
  const [loading, setLoading] = useState(false);
  const [awards, setAwards] = useState<Award[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function buscar() {
    setError(null);
    setMessage(null);
    setLoading(true);
    setAwards([]);
    setStats(null);

    try {
      const params = new URLSearchParams({ year });
      if (search.trim()) params.set("search", search.trim());
      
      const res = await fetch(`/api/precios-dncp?${params}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      if (data.message) setMessage(data.message);
      
      setAwards(data.awards || []);
      setStats(data.stats);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al consultar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
          <TrendingUp className="h-3.5 w-3.5 text-[#C96442]" />
          Datos de la DNCP · Actualizado en tiempo real
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1F1E1D] leading-tight mb-3">
          Inteligencia de Precios
        </h1>
        <p className="text-lg text-[#5C5B57] max-w-lg mx-auto">
          Precios adjudicados en licitaciones del Estado paraguayo. Buscá por producto, proveedor o entidad.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder='Ej: "combustible", "MSPBS", "limpieza"'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1"
                autoFocus
              />
              <div className="flex gap-2">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-12 px-3 rounded-xl border border-[#D4D2C9] bg-white text-sm text-[#5C5B57] focus:outline-none focus:ring-2 focus:ring-[#C96442]"
                >
                  {["2026","2025","2024","2023","2022"].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <Button
                  onClick={buscar}
                  disabled={loading}
                  className="h-12 px-4 sm:px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
            )}
            {message && (
              <p className="text-sm text-[#87867F] text-center">{message}</p>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { label: "Mínimo", value: fmtGs(stats.min), color: "text-[#5A7D5A]" },
                  { label: "Promedio", value: fmtGs(stats.avg), color: "text-[#C96442]" },
                  { label: "Máximo", value: fmtGs(stats.max), color: "text-[#B89B4B]" },
                ].map((s) => (
                  <div key={s.label} className="bg-[#F5F4ED] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#87867F] mb-1">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
                <p className="col-span-3 text-xs text-[#87867F] text-center">
                  {stats.count} adjudicaciones · {stats.currency} · {year}
                </p>
              </div>
            )}

            {/* Awards list */}
            {awards.length > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">
                  Adjudicaciones {search ? `para "${search}"` : "recientes"}:
                </p>
                {awards.map((award, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F1E1D] text-sm leading-snug">{award.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Building2 className="h-3 w-3 text-[#87867F] shrink-0" />
                          <span className="text-xs text-[#5C5B57] truncate">{award.entity}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-[#C96442]">{fmtGs(award.amount)} Gs</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#F5F4ED] border-0 text-xs">
                        <User className="h-3 w-3 mr-1" />
                        {award.supplier}
                      </Badge>
                      {award.date && (
                        <Badge className="bg-[#F5F4ED] text-[#87867F] hover:bg-[#F5F4ED] border-0 text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(award.date).toLocaleDateString("es-PY")}
                        </Badge>
                      )}
                      {award.dncp_url && (
                        <a
                          href={award.dncp_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#C96442] hover:underline font-medium ml-auto"
                        >
                          Ver expediente en DNCP ↗
                        </a>
                      )}
                    </div>
                    {award.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {award.items.map((item, j) => (
                          <span key={j} className="text-xs text-[#87867F] bg-[#F5F4ED] px-2 py-0.5 rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
