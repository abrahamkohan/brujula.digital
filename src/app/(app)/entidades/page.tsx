"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Entidad { id: string; nombre: string; tipo: string; nivel: string; sicp: string; }

export default function EntidadesPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [entidades, setEntidades] = useState<Entidad[]>([]);

  async function buscar() {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/entidades${params}`);
      const json = await res.json();
      setEntidades(json.entidades || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">Entidades del Estado</h1>
          <p className="text-[#5C5B57]">Organismos que compran. Buscá ministerios, gobernaciones, municipalidades.</p>
        </div>

        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Ministerio, Gobernación, Municipalidad..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1" autoFocus />
              <Button onClick={buscar} disabled={loading} className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {entidades.length === 0 && !loading && (
              <p className="text-center text-sm text-[#87867F] py-8">Buscá un ministerio o entidad para empezar</p>
            )}

            {entidades.map((e, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#D4D2C9] p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#4A7B9D]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5 text-[#4A7B9D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F1E1D] text-sm">{e.nombre}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {e.tipo && <Badge className="bg-[#F5F4ED] text-[#5C5B57] hover:bg-[#F5F4ED] border-0 text-[10px]">{e.tipo}</Badge>}
                        {e.nivel && <Badge className="bg-[#F5F4ED] text-[#87867F] hover:bg-[#F5F4ED] border-0 text-[10px]">{e.nivel}</Badge>}
                        {e.sicp && <span className="text-[10px] text-[#87867F] font-mono">SICP {e.sicp}</span>}
                      </div>
                    </div>
                  </div>
                  <Link href={`/precios?search=${encodeURIComponent(e.nombre)}`} className="text-xs text-[#C96442] hover:underline shrink-0 whitespace-nowrap">
                    Ver compras ↗
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
