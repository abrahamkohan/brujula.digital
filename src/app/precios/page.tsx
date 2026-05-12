"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, TrendingDown, Minus, Loader2, Package } from "lucide-react";

interface CatalogoItem {
  id: string;
  description: string;
  classification?: { id: string; description: string };
}

interface Adjudicacion {
  id?: string;
  award?: {
    value?: { amount: number; currency: string };
    suppliers?: Array<{ name: string; id: string }>;
    date?: string;
  };
  tender?: {
    title?: string;
    procuringEntity?: { name: string };
    items?: Array<{ description: string; quantity: number }>;
  };
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
  const [catalogo, setCatalogo] = useState<CatalogoItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [adjudicaciones, setAdjudicaciones] = useState<Adjudicacion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buscarCatalogo() {
    if (!search.trim()) return;
    setError(null);
    setCatalogo([]);
    setLoading(true);
    setSelectedItem(null);
    setAdjudicaciones([]);
    setStats(null);

    try {
      const res = await fetch(`/api/precios-dncp?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Extract items from OCDS release format or direct items
      const items = (data.items || []).map((r: Record<string, unknown>) => {
        const award = (r as { award?: { items?: Array<CatalogoItem> } }).award;
        const items = award?.items;
        if (items && items[0]) return items[0];
        // Try direct catalog format
        const desc = (r as { description?: string }).description;
        const id = (r as { id?: string }).id;
        const classification = (r as { classification?: { id: string; description: string } }).classification;
        if (desc) return { id: id ?? classification?.id ?? "", description: desc, classification };
        return null;
      }).filter(Boolean);
      
      setCatalogo(items.slice(0, 20));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  }

  async function verPrecios(code: string) {
    setError(null);
    setSelectedItem(code);
    setLoading(true);
    setAdjudicaciones([]);
    setStats(null);

    try {
      const res = await fetch(`/api/precios-dncp?code=${code}&year=${selectedYear}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAdjudicaciones(data.items || []);
      setStats(data.stats);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al consultar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1F1E1D] leading-tight mb-3">
          Inteligencia de Precios
        </h1>
        <p className="text-lg text-[#5C5B57] max-w-lg mx-auto">
          Historial de precios adjudicados en licitaciones del Estado. Buscá por producto.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder='Ej: "combustible", "limpieza", "computadora"'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscarCatalogo()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442]"
                autoFocus
              />
              <Button
                onClick={buscarCatalogo}
                disabled={loading || !search.trim()}
                className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                {error}
              </div>
            )}

            {/* Catalog results */}
            {catalogo.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">
                  Seleccioná un producto:
                </p>
                {catalogo.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => verPrecios(item.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors ${
                      selectedItem === item.id
                        ? "border-[#C96442] bg-[#C96442]/5"
                        : "border-[#D4D2C9] bg-white hover:border-[#C96442]/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#C96442] shrink-0" />
                      <span className="text-sm font-medium text-[#1F1E1D]">{item.description}</span>
                    </div>
                    {item.classification?.id && (
                      <p className="text-xs text-[#87867F] mt-1 ml-6">
                        Código: {item.classification.id}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E5E4DD]">
                <div className="bg-[#F5F4ED] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#87867F] mb-1">Mínimo</p>
                  <p className="text-lg font-bold text-[#5A7D5A]">{fmtGs(stats.min)}</p>
                </div>
                <div className="bg-[#F5F4ED] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#87867F] mb-1">Promedio</p>
                  <p className="text-lg font-bold text-[#C96442]">{fmtGs(stats.avg)}</p>
                </div>
                <div className="bg-[#F5F4ED] rounded-xl p-3 text-center">
                  <p className="text-xs text-[#87867F] mb-1">Máximo</p>
                  <p className="text-lg font-bold text-[#B89B4B]">{fmtGs(stats.max)}</p>
                </div>
                <p className="col-span-3 text-xs text-[#87867F] text-center">
                  {stats.count} adjudicaciones · {stats.currency} · Año {selectedYear}
                </p>
              </div>
            )}

            {/* Adjudicaciones list */}
            {adjudicaciones.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">
                  Últimas adjudicaciones:
                </p>
                {adjudicaciones.slice(0, 10).map((adj, i) => {
                  const amount = adj.award?.value?.amount;
                  const supplier = adj.award?.suppliers?.[0]?.name;
                  const entity = adj.tender?.procuringEntity?.name;
                  return (
                    <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#1F1E1D] truncate max-w-[250px]">
                            {supplier ?? "Proveedor"}
                          </p>
                          <p className="text-xs text-[#87867F]">{entity}</p>
                        </div>
                        <span className="text-sm font-bold text-[#C96442]">
                          {amount ? `${fmtGs(amount)} Gs` : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
