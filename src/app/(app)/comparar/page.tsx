"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeftRight, Building2, DollarSign, FileText } from "lucide-react";

interface Comp { nombre: string; contratos: number; monto: number; }

export default function CompararPage() {
  const [a, setA] = useState(""); const [b, setB] = useState("");
  const [resA, setResA] = useState<Comp | null>(null);
  const [resB, setResB] = useState<Comp | null>(null);
  const [loading, setLoading] = useState(false);

  async function comparar() {
    if (!a || !b) return; setLoading(true);
    const [ra, rb] = await Promise.all([
      fetch(`/api/comparar?q=${encodeURIComponent(a)}`).then(r => r.json()),
      fetch(`/api/comparar?q=${encodeURIComponent(b)}`).then(r => r.json()),
    ]);
    setResA(ra); setResB(rb); setLoading(false);
  }

  function fmtGs(n: number) { return n >= 1_000_000_000 ? `${(n/1_000_000_000).toFixed(1)} MM` : n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)} M` : `${n}`; }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">Comparar Proveedores</h1>
          <p className="text-[#5C5B57]">Dos empresas, lado a lado. Contratos, montos, actividad.</p>
        </div>

        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Proveedor A (nombre o RUC)" value={a} onChange={e => setA(e.target.value)} className="h-12 bg-white border-[#D4D2C9]" />
              <Input placeholder="Proveedor B (nombre o RUC)" value={b} onChange={e => setB(e.target.value)} className="h-12 bg-white border-[#D4D2C9]" />
            </div>
            <Button onClick={comparar} disabled={loading || !a || !b} className="w-full h-12 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ArrowLeftRight className="h-5 w-5 mr-2" /> Comparar</>}
            </Button>

            {(resA || resB) && (
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {[{ r: resA, label: "A", q: a }, { r: resB, label: "B", q: b }].map(({ r, label, q }) => (
                  <div key={label} className="bg-[#F5F4ED] rounded-2xl p-5">
                    <p className="text-xs text-[#87867F] uppercase tracking-wider mb-3">Proveedor {label}</p>
                    {r?.nombre ? (
                      <div className="space-y-3">
                        <p className="font-bold text-[#1F1E1D]">{r.nombre}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-xl p-3 text-center"><p className="text-[10px] text-[#87867F]">Contratos</p><p className="font-bold text-[#4A7B9D]">{r.contratos}</p></div>
                          <div className="bg-white rounded-xl p-3 text-center"><p className="text-[10px] text-[#87867F]">Monto total</p><p className="font-bold text-[#C96442] text-sm">{fmtGs(r.monto)} Gs</p></div>
                        </div>
                      </div>
                    ) : <p className="text-sm text-[#87867F]">{q ? `No encontrado: "${q}"` : "—"}</p>}
                  </div>
                ))}
                {resA && resB && (
                  <div className="sm:col-span-2 text-center pt-2 border-t border-[#D4D2C9]">
                    <p className="text-sm font-bold text-[#1F1E1D]">
                      {resA.contratos > resB.contratos ? resA.nombre : resB.nombre} tiene más contratos
                      ({Math.abs(resA.contratos - resB.contratos)} más)
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
