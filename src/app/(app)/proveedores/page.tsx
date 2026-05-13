"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Proveedor {
  id: string; name: string; ruc: string; contratos: number; monto_total: number;
}

export default function ProveedoresPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [message, setMessage] = useState("");

  async function buscar() {
    if (!search.trim()) return;
    setLoading(true); setMessage("");
    try {
      const res = await fetch(`/api/proveedores?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.error) { setMessage(json.error); setProveedores([]); }
      else {
        setProveedores(json.proveedores || []);
        if (json.proveedores?.length === 0) setMessage("Sin resultados");
      }
    } catch { setMessage("Error al buscar"); }
    finally { setLoading(false); }
  }

  function fmtGs(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} MM`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
    return `${n}`;
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">Directorio de Proveedores</h1>
          <p className="text-[#5C5B57]">Empresas que contratan con el Estado paraguayo</p>
        </div>

        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Nombre de empresa..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1" autoFocus />
              <Button onClick={buscar} disabled={loading || !search.trim()}
                className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            {message && <p className="text-sm text-[#87867F] text-center">{message}</p>}

            {proveedores.map((p, i) => (
              <Link key={i} href={`/score?name=${encodeURIComponent(p.name)}`}
                className="flex items-center justify-between bg-white rounded-xl border border-[#D4D2C9] p-4 hover:border-[#C96442]/30 hover:shadow-sm transition-all group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#4A7B9D]/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-[#4A7B9D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#1F1E1D] text-sm group-hover:text-[#C96442] transition-colors truncate">{p.name}</p>
                    <p className="text-xs text-[#87867F]">RUC {p.ruc} · {p.contratos} contratos · {fmtGs(p.monto_total)} Gs</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#D4D2C9] group-hover:text-[#C96442] shrink-0 transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
