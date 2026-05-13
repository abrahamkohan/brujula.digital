"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ShieldCheck, UserX, Loader2, AlertCircle, Share2, Check, List, Hash } from "lucide-react";

interface Resultado {
  encontrado: boolean;
  cedula: string;
  nombre?: string;
  apellido?: string;
  organismo?: string;
  cargo?: string;
  estado?: string;
  ultima_actualizacion?: string;
}

export default function VerificarPage() {
  const [ci, setCi] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modo, setModo] = useState<"simple"|"bulk">("simple");
  const [bulkCIs, setBulkCIs] = useState("");
  const [bulkResults, setBulkResults] = useState<Array<{ci:string;encontrado:boolean;nombre:string;organismo:string;cargo:string;estado:string}>>([]);
  const [bulkStats, setBulkStats] = useState<{total:number;encontrados:number;no_encontrados:number}|null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  function compartir() {
    navigator.clipboard.writeText(`${window.location.origin}/verificar?ci=${ci}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function buscar() {
    setError(null);
    setResultado(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/verificar-funcionario?ci=${ci.replace(/\D/g, "")}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al verificar");
        return;
      }

      setResultado(data);
    } catch {
      setError("No pudimos conectar. Verificá tu conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Hero */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 rounded-full mb-4 sm:mb-6 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C96442]" />
          Datos oficiales · Resultado en segundos
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3 sm:mb-4">
          ¿Es funcionario<br />público?
        </h1>
        <p className="text-base sm:text-lg text-[#5C5B57] max-w-md mx-auto leading-relaxed">
          Ingresá una cédula de identidad paraguaya y verificá si trabaja en el Estado.
        </p>
      </section>

      {/* Search */}
      <section className="max-w-md mx-auto px-6 pb-20">
        <Card className="border-[#D4D2C9] shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 4567890"
                value={ci}
                onChange={(e) => setCi(e.target.value.replace(/\D/g, "").slice(0, 8))}
                onKeyDown={(e) => e.key === "Enter" && ci.length >= 5 && buscar()}
                className="h-12 text-lg bg-white border-[#D4D2C9] focus-visible:ring-[#C96442]"
                autoFocus
                inputMode="numeric"
              />
              <Button
                onClick={buscar}
                disabled={loading || ci.length < 5}
                className="h-12 px-6 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <p className="text-xs text-[#87867F] text-center">
              Gratis · 3 consultas por día sin registro
            </p>
            <button onClick={compartir} className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#C96442] hover:bg-[#C96442]/5 rounded-lg transition-colors">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? "¡Copiado!" : "Compartir resultado"}
            </button>
          </CardContent>
        </Card>

        {/* Result */}
        {resultado && (
          <Card className={`mt-4 border-2 shadow-sm ${
            resultado.encontrado ? "border-[#5A7D5A]/30" : "border-[#D4D2C9]"
          }`}>
            <CardContent className="pt-6 space-y-4">
              {resultado.encontrado ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#5A7D5A]/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-[#5A7D5A]" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1F1E1D] text-lg">
                        {resultado.nombre} {resultado.apellido}
                      </p>
                      <p className="text-sm text-[#5C5B57]">CI {resultado.cedula}</p>
                    </div>
                    <Badge className="ml-auto bg-[#5A7D5A]/10 text-[#5A7D5A] hover:bg-[#5A7D5A]/10 border-0">
                      Funcionario {resultado.estado === "activo" ? "Activo" : resultado.estado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E4DD]">
                    <div className="bg-[#F5F4ED] rounded-xl p-3">
                      <p className="text-xs text-[#87867F] mb-1">Organismo</p>
                      <p className="text-sm font-semibold text-[#1F1E1D]">{resultado.organismo ?? "—"}</p>
                    </div>
                    <div className="bg-[#F5F4ED] rounded-xl p-3">
                      <p className="text-xs text-[#87867F] mb-1">Cargo</p>
                      <p className="text-sm font-semibold text-[#1F1E1D]">{resultado.cargo ?? "—"}</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#87867F] text-center">
                    Última actualización:{" "}
                    {resultado.ultima_actualizacion
                      ? new Date(resultado.ultima_actualizacion).toLocaleDateString("es-PY")
                      : "—"}
                  </p>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#F5F4ED] flex items-center justify-center mx-auto mb-3">
                    <UserX className="h-6 w-6 text-[#87867F]" />
                  </div>
                  <p className="font-bold text-[#1F1E1D] text-lg">No es funcionario público</p>
                  <p className="text-sm text-[#5C5B57] mt-1">
                    No encontramos a la CI {resultado.cedula} en los registros oficiales.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Bulk mode */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setModo("simple")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${modo==="simple"?"bg-[#C96442] text-white":"bg-white text-[#5C5B57] border border-[#D4D2C9]"}`}>Individual</button>
          <button onClick={() => setModo("bulk")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${modo==="bulk"?"bg-[#C96442] text-white":"bg-white text-[#5C5B57] border border-[#D4D2C9]"}`}>Bulk (múltiples CIs)</button>
        </div>
        {modo==="bulk" && (
          <Card className="border-[#D4D2C9] shadow-sm"><CardContent className="pt-6 space-y-4">
            <textarea value={bulkCIs} onChange={e=>setBulkCIs(e.target.value)} placeholder="4567890&#10;2345678&#10;1234567" rows={6} className="w-full rounded-xl border border-[#D4D2C9] bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C96442]" />
            <Button onClick={async()=>{const cis=bulkCIs.split('\n').filter(l=>l.trim());if(!cis.length||cis.length>100)return;setBulkLoading(true);setBulkResults([]);setBulkStats(null);try{const r=await fetch('/api/verificar-funcionario/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cis})});const j=await r.json();setBulkResults(j.results||[]);setBulkStats(j.stats)}catch(e){}finally{setBulkLoading(false)}}} disabled={bulkLoading||!bulkCIs.trim()} className="w-full h-12 bg-[#C96442] hover:bg-[#B5583A] text-white font-semibold">{bulkLoading?<Loader2 className="h-5 w-5 animate-spin mx-auto"/>:`Verificar ${bulkCIs.split('\n').filter(l=>l.trim()).length} CIs`}</Button>
            {bulkStats&&<div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E4DD]"><div className="text-center"><p className="text-xs text-[#87867F]">Total</p><p className="font-bold">{bulkStats.total}</p></div><div className="text-center"><p className="text-xs text-[#87867F]">Encontrados</p><p className="font-bold text-[#5A7D5A]">{bulkStats.encontrados}</p></div><div className="text-center"><p className="text-xs text-[#87867F]">No encontrados</p><p className="font-bold text-[#C96442]">{bulkStats.no_encontrados}</p></div></div>}
            {bulkResults.length>0&&<div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="border-b border-[#E5E4DD]"><th className="text-left py-2 text-[#87867F]">CI</th><th className="text-left py-2 text-[#87867F]">Nombre</th><th className="text-left py-2 text-[#87867F]">Organismo</th><th className="text-left py-2 text-[#87867F]">Estado</th></tr></thead><tbody>{bulkResults.map((r,i)=><tr key={i} className="border-b border-[#E5E4DD]"><td className="py-2 font-mono">{r.ci}</td><td className="py-2">{r.encontrado?<span className="font-medium">{r.nombre}</span>:<span className="text-[#87867F]">—</span>}</td><td className="py-2 text-[#5C5B57]">{r.organismo||"—"}</td><td className="py-2">{r.encontrado?<Badge className="bg-[#5A7D5A]/10 text-[#5A7D5A] text-[10px]">{r.estado}</Badge>:<Badge className="bg-gray-100 text-[#87867F] text-[10px]">No</Badge>}</td></tr>)}</tbody></table></div>}
          </CardContent></Card>
        )}
      </section>

      <footer className="text-center pb-10">
        <p className="text-xs text-[#87867F]">
          Brujula · Datos públicos, dirección clara.
        </p>
      </footer>
    </div>
  );
}
