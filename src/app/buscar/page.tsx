"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShieldCheck, TrendingUp, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ tipo: string; titulo: string; desc: string; href: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function buscar() {
    if (!query.trim()) return;
    setLoading(true);
    const q = query.trim();

    // Smart routing based on input
    const isCI = /^\d{5,8}$/.test(q.replace(/\D/g, ""));
    const isRUC = /\d+-\d/.test(q);

    if (isCI) {
      window.location.href = `/verificar?ci=${q.replace(/\D/g, "")}`;
      return;
    }
    if (isRUC) {
      window.location.href = `/score?ruc=${q}`;
      return;
    }

    // Search all modules
    const items = [
      { tipo: "Funcionario", titulo: `Buscar "${q}" en funcionarios`, desc: "Verificación por CI", href: `/verificar` },
      { tipo: "Precios", titulo: `Buscar "${q}" en licitaciones`, desc: "Precios adjudicados DNCP", href: `/precios` },
      { tipo: "Empresa", titulo: `Buscar "${q}" como empresa`, desc: "Score y contratos", href: `/score?name=${encodeURIComponent(q)}` },
    ];
    setResults(items);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-4">Buscador Unificado</h1>
        <p className="text-[#5C5B57] mb-8 max-w-md mx-auto">Una sola barra. CI, RUC, producto o empresa. Brujula te lleva.</p>

        <Card className="border-[#D4D2C9] shadow-sm text-left">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="CI, RUC, producto o empresa..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1 text-base"
                autoFocus
              />
              <Button onClick={buscar} disabled={loading || !query.trim()}
                className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {results.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-[#87867F] uppercase tracking-wider">Resultados:</p>
                {results.map((r, i) => (
                  <Link key={i} href={r.href} className="flex items-center gap-4 bg-white rounded-xl border border-[#D4D2C9] p-4 hover:border-[#C96442]/30 hover:shadow-sm transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      r.tipo === "Funcionario" ? "bg-[#C96442]/10 text-[#C96442]" :
                      r.tipo === "Precios" ? "bg-[#5A7D5A]/10 text-[#5A7D5A]" :
                      "bg-[#4A7B9D]/10 text-[#4A7B9D]"}`}>
                      {r.tipo === "Funcionario" ? <ShieldCheck className="h-5 w-5" /> :
                       r.tipo === "Precios" ? <TrendingUp className="h-5 w-5" /> :
                       <Shield className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F1E1D] text-sm group-hover:text-[#C96442] transition-colors">{r.titulo}</p>
                      <p className="text-xs text-[#87867F]">{r.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#D4D2C9] group-hover:text-[#C96442] transition-colors" />
                  </Link>
                ))}
              </div>
            )}

            {/* Quick access */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E4DD]">
              {[
                { label: "Funcionario", href: "/verificar", icon: ShieldCheck, color: "text-[#C96442]" },
                { label: "Precios", href: "/precios", icon: TrendingUp, color: "text-[#5A7D5A]" },
                { label: "Empresa", href: "/score", icon: Shield, color: "text-[#4A7B9D]" },
              ].map(t => (
                <Link key={t.label} href={t.href} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#D4D2C9] text-xs font-medium text-[#5C5B57] hover:bg-white hover:border-[#C96442]/30 transition-colors">
                  <t.icon className={`h-3.5 w-3.5 ${t.color}`} /> {t.label}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
