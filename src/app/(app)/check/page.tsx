"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, Building2, Loader2, AlertCircle, UserX, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface Funcionario {
  cedula: string; nombre: string; apellido: string; organismo: string; cargo: string; estado: string;
}
interface Empresa {
  nombre: string; ruc: string; categorias: string[]; sanciones: string[]; contratos: number;
}
interface Resultado {
  consulta: string; tipo: string; funcionario: Funcionario | null; empresa: Empresa | null; encontrado: boolean;
}

export default function CheckPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resultado | null>(null);
  const [error, setError] = useState("");

  async function buscar() {
    setError(""); setData(null); setLoading(true);
    try {
      const res = await fetch(`/api/background-check?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setData(json);
    } catch { setError("Error al consultar"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C96442]" /> Perfil completo · CI o RUC
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">Background Check</h1>
          <p className="text-[#5C5B57] max-w-md mx-auto">Perfil completo de persona o empresa en segundos. Ingresá una CI o RUC.</p>
        </div>

        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="CI: 4567890 o RUC: 80012345-7" value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && q.length >= 5 && buscar()}
                className="h-12 bg-white border-[#D4D2C9] focus-visible:ring-[#C96442] flex-1" autoFocus />
              <Button onClick={buscar} disabled={loading || q.length < 5} className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-xs text-[#87867F] text-center">Ej: 8361350 · 4567890 · 80012345-7</p>
            {error && <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}

            {data && !data.encontrado && (
              <div className="text-center py-6">
                <UserX className="h-10 w-10 text-[#D4D2C9] mx-auto mb-3" />
                <p className="font-bold text-[#1F1E1D]">Sin resultados</p>
                <p className="text-sm text-[#87867F]">No encontramos "{data.consulta}" en los registros.</p>
              </div>
            )}

            {data?.funcionario && (
              <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-[#5A7D5A]" />
                  <p className="font-bold text-[#1F1E1D]">Funcionario Público</p>
                  <Badge className={data.funcionario.estado === "activo" ? "bg-[#5A7D5A]/10 text-[#5A7D5A]" : "bg-amber-50 text-amber-600"}>{data.funcionario.estado}</Badge>
                </div>
                <p className="text-xl font-bold text-[#1F1E1D]">{data.funcionario.nombre} {data.funcionario.apellido}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F5F4ED] rounded-xl p-3"><p className="text-xs text-[#87867F]">Organismo</p><p className="text-sm font-semibold">{data.funcionario.organismo}</p></div>
                  <div className="bg-[#F5F4ED] rounded-xl p-3"><p className="text-xs text-[#87867F]">Cargo</p><p className="text-sm font-semibold">{data.funcionario.cargo}</p></div>
                </div>
              </div>
            )}

            {data?.empresa && (
              <div className="bg-white rounded-2xl border border-[#D4D2C9] p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#4A7B9D]" />
                  <p className="font-bold text-[#1F1E1D]">Empresa</p>
                </div>
                <p className="text-xl font-bold text-[#1F1E1D]">{data.empresa.nombre}</p>
                <p className="text-sm text-[#5C5B57]">RUC {data.empresa.ruc}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F5F4ED] rounded-xl p-3 text-center"><p className="text-xs text-[#87867F]">Contratos</p><p className="font-bold text-[#4A7B9D]">{data.empresa.contratos}</p></div>
                  <div className="bg-[#F5F4ED] rounded-xl p-3 text-center"><p className="text-xs text-[#87867F]">Categorías</p><p className="font-bold text-[#C96442]">{data.empresa.categorias.length}</p></div>
                  <div className="bg-[#F5F4ED] rounded-xl p-3 text-center"><p className="text-xs text-[#87867F]">Sanciones</p><p className={`font-bold ${data.empresa.sanciones.length > 0 ? "text-red-500" : "text-[#5A7D5A]"}`}>{data.empresa.sanciones.length}</p></div>
                </div>
                {data.empresa.sanciones.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <div>{data.empresa.sanciones.map((s,i) => <p key={i} className="text-xs text-red-800">{s}</p>)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{ label: "Funcionario", href: "/verificar" }, { label: "Empresa", href: "/score" }, { label: "Precios", href: "/precios" }].map(t => (
            <Link key={t.href} href={t.href} className="text-center py-2.5 rounded-xl border border-[#D4D2C9] text-xs text-[#5C5B57] hover:bg-white hover:border-[#C96442]/30 transition-colors">{t.label}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
