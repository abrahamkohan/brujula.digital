"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Inmueble { numero_finca:string; propietario:string; superficie:number; valuacion:number; zona:string; precio_m2:number; hipotecas:boolean; }

export default function InmobiliarioPage() {
  const [items, setItems] = useState<Inmueble[]>([]);
  useEffect(() => { createClient().from("inmuebles").select("*").then(({data}) => setItems(data??[])); }, []);
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] mb-3">Inteligencia Inmobiliaria</h1>
          <p className="text-[#5C5B57]">Due diligence, valuación y datos del mercado inmobiliario paraguayo</p>
        </div>
        <div className="space-y-4">
          {items.map((p,i) => (
            <Card key={i} className="border-[#D4D2C9]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1F1E1D]">Finca {p.numero_finca}</p>
                    <p className="text-xs text-[#87867F]">{p.propietario}</p>
                  </div>
                  <Badge className={p.hipotecas ? "bg-red-50 text-red-600" : "bg-[#5A7D5A]/10 text-[#5A7D5A]"}>{p.hipotecas ? "Hipoteca activa" : "Sin hipotecas"}</Badge>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {[{l:"Superficie",v:`${p.superficie} m²`},{l:"Valuación",v:`Gs ${(p.valuacion/1000000).toFixed(0)}M`},{l:"Zona",v:p.zona},{l:"Precio/m²",v:`USD ${p.precio_m2}`}].map(s=>(
                    <div key={s.l} className="bg-[#F5F4ED] rounded-lg p-2 text-center"><p className="text-[#87867F]">{s.l}</p><p className="font-bold text-[#C96442]">{s.v}</p></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
