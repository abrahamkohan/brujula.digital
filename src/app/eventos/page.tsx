"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Music, Trophy, Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Evento { id: string; titulo: string; categoria: string; fecha: string; venue: string; precio_min: number; precio_max: number; capacidad: number; impacto: string; }

const catIcons: Record<string, typeof Music> = { concierto: Music, deporte: Trophy, feria: Building2, congreso: Users, otro: Calendar };
const impactoColors: Record<string, string> = { mega: "bg-red-500 text-white", alto: "bg-amber-500 text-white", medio: "bg-blue-500 text-white", bajo: "bg-gray-400 text-white" };

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createClient().from("eventos").select("*").order("fecha").then(({ data }) => {
      setEventos(data ?? []); setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-[#C96442]" /></div>;

  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] mb-3">Radar de Eventos</h1>
          <p className="text-[#5C5B57]">Revenue intelligence para Airbnb, hoteles y restaurantes</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {eventos.map(e => {
            const Icon = catIcons[e.categoria] || Calendar;
            return (
              <Card key={e.id} className="border-[#D4D2C9] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#C96442]" />
                      <span className="text-xs text-[#87867F] capitalize">{e.categoria}</span>
                    </div>
                    <Badge className={impactoColors[e.impacto] + " text-[10px]"}>{e.impacto}</Badge>
                  </div>
                  <h3 className="font-bold text-[#1F1E1D]">{e.titulo}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#5C5B57]">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.fecha).toLocaleDateString("es-PY", { day:"numeric", month:"long" })}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E4DD]">
                    <span className="text-xs text-[#87867F]">Gs {e.precio_min?.toLocaleString()} – {e.precio_max?.toLocaleString()}</span>
                    <span className="text-xs text-[#87867F]">{e.capacidad?.toLocaleString()} personas</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
