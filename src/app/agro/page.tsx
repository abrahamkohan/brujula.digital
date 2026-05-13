"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wheat, TrendingUp, DollarSign, MapPin, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Precio { cultivo:string; precio_productor:number; precio_cbot:number; tipo_cambio:number; departamento:string; }

export default function AgroPage() {
  const [items, setItems] = useState<Precio[]>([]);
  useEffect(() => { createClient().from("precios_agro").select("*").order("cultivo").then(({data}) => setItems(data??[])); }, []);
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] mb-3">Agro Intelligence</h1>
          <p className="text-[#5C5B57]">Monitor de precios de commodities, producción y alertas fitosanitarias</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((p,i) => (
            <Card key={i} className="border-[#D4D2C9]">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-[#5A7D5A]" />
                  <h3 className="text-lg font-bold text-[#1F1E1D] capitalize">{p.cultivo}</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[{l:"Productor",v:`Gs ${p.precio_productor?.toLocaleString()}/ton`},{l:"CBOT",v:`USD ${p.precio_cbot}/bu`},{l:"Tipo cambio",v:`Gs ${p.tipo_cambio}`},{l:"Departamento",v:p.departamento}].map(s=>(
                    <div key={s.l} className="bg-[#F5F4ED] rounded-lg p-2"><p className="text-[#87867F]">{s.l}</p><p className="font-bold text-[#C96442]">{s.v}</p></div>
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
