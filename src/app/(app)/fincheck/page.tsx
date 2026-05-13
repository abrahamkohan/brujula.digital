"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Loader2, Banknote, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Cooperativa { nombre: string; total_asociados: number; mora_pct: number; liquidez_pct: number; score_salud: number; clasificacion: string; }
interface Tasa { institucion: string; tipo: string; tasa_consumo: number; tasa_vivienda: number; tasa_ahorro: number; }

const saludColors: Record<string, string> = {
  saludable: "bg-[#5A7D5A]/10 text-[#5A7D5A]", estable: "bg-amber-50 text-amber-600",
  alerta: "bg-orange-50 text-orange-600", riesgo: "bg-red-50 text-red-600", critica: "bg-red-100 text-red-700"
};

export default function FinCheckPage() {
  const [coops, setCoops] = useState<Cooperativa[]>([]);
  const [tasas, setTasas] = useState<Tasa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      createClient().from("cooperativas").select("*"),
      createClient().from("tasas_financieras").select("*").order("tasa_consumo"),
    ]).then(([c, t]) => { setCoops(c.data ?? []); setTasas(t.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#C96442]" /></div>;

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] mb-3">FinCheck</h1>
          <p className="text-[#5C5B57]">Salud de cooperativas · Comparador de tasas · BCP + INCOOP</p>
        </div>

        <h2 className="text-lg font-bold text-[#1F1E1D] mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-[#C96442]" /> Salud de Cooperativas</h2>
        <div className="space-y-3 mb-10">
          {coops.map(c => (
            <Card key={c.nombre} className="border-[#D4D2C9]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1F1E1D]">{c.nombre}</p>
                    <p className="text-xs text-[#87867F]">{c.total_asociados?.toLocaleString()} asociados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#C96442]">{c.score_salud}/100</p>
                    <Badge className={saludColors[c.clasificacion] + " text-[10px] capitalize"}>{c.clasificacion}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F5F4ED] rounded-lg p-2"><span className="text-[#87867F]">Mora:</span> <span className="font-bold text-[#C96442]">{c.mora_pct}%</span></div>
                  <div className="bg-[#F5F4ED] rounded-lg p-2"><span className="text-[#87867F]">Liquidez:</span> <span className="font-bold text-[#5A7D5A]">{c.liquidez_pct}%</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="text-lg font-bold text-[#1F1E1D] mb-4 flex items-center gap-2"><Banknote className="h-5 w-5 text-[#C96442]" /> Comparador de Tasas</h2>
        <Card className="border-[#D4D2C9]">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#D4D2C9]"><th className="text-left py-2 text-[#87867F] font-medium">Institución</th><th className="text-left py-2 text-[#87867F] font-medium">Tipo</th><th className="text-right py-2 text-[#87867F] font-medium">Consumo</th><th className="text-right py-2 text-[#87867F] font-medium">Vivienda</th><th className="text-right py-2 text-[#87867F] font-medium">Ahorro</th></tr></thead>
                <tbody>
                  {tasas.map(t => (
                    <tr key={t.institucion} className="border-b border-[#E5E4DD]">
                      <td className="py-3 font-medium text-[#1F1E1D]">{t.institucion}</td>
                      <td className="py-3"><Badge className="bg-[#F5F4ED] text-[#87867F] text-[10px] capitalize">{t.tipo}</Badge></td>
                      <td className="py-3 text-right font-bold text-[#C96442]">{t.tasa_consumo}%</td>
                      <td className="py-3 text-right text-[#5C5B57]">{t.tasa_vivienda}%</td>
                      <td className="py-3 text-right text-[#5A7D5A]">{t.tasa_ahorro}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
