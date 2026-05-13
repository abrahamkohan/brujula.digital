"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Building2, Trees, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PortalPage() {
  const [items, setItems] = useState<Array<{titulo:string;categoria:string;departamento:string;descripcion:string}>>([]);
  useEffect(() => { createClient().from("portales").select("*").then(({data}) => setItems(data??[])); }, []);
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] mb-3">Portal Paraguay</h1>
          <p className="text-[#5C5B57]">Qué hacer, qué visitar. La guía que Paraguay no tiene.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {items.map((p,i) => (
            <Card key={i} className="border-[#D4D2C9] hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  {p.categoria==="naturaleza"?<Trees className="h-4 w-4 text-[#5A7D5A]"/>:<Building2 className="h-4 w-4 text-[#C96442]"/>}
                  <span className="text-xs text-[#87867F] capitalize">{p.categoria}</span>
                </div>
                <h3 className="font-bold text-[#1F1E1D]">{p.titulo}</h3>
                <p className="text-xs text-[#5C5B57] line-clamp-2">{p.descripcion}</p>
                <p className="text-[10px] text-[#87867F] flex items-center gap-1"><MapPin className="h-3 w-3"/>{p.departamento}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
