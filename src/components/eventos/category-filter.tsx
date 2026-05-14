"use client";

import { Music, Trophy, Building2, Users, Sparkles, Film, Calendar } from "lucide-react";

interface Props {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
}

const CAT_LABELS: Record<string, { icon: typeof Music; label: string }> = {
  concierto:        { icon: Music,     label: "Conciertos" },
  deporte:          { icon: Trophy,    label: "Deportes" },
  teatro:           { icon: Film,      label: "Teatro" },
  feria:            { icon: Building2, label: "Ferias" },
  entretenimiento:  { icon: Sparkles,  label: "Entretenimiento" },
  congreso:         { icon: Users,     label: "Congresos" },
};

export default function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onChange("todas")}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
          active === "todas"
            ? "bg-[#C96442] text-[#F5F4ED]"
            : "bg-[#E5E4DD] text-[#5C5B57] hover:bg-[#D4D2C9]"
        }`}
      >
        Todas
      </button>
      {categories.map((cat) => {
        const meta = CAT_LABELS[cat] ?? { icon: Calendar, label: cat };
        const Icon = meta.icon;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              active === cat
                ? "bg-[#C96442] text-[#F5F4ED]"
                : "bg-[#E5E4DD] text-[#5C5B57] hover:bg-[#D4D2C9]"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
