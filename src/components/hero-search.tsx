"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function buscar() {
    if (!q.trim()) return;
    const cleaned = q.trim();
    const isCI = /^\d{5,8}$/.test(cleaned.replace(/\D/g, ""));
    const isRUC = /^\d/.test(cleaned) && cleaned.replace(/\D/g, "").length >= 6;

    if (isCI) router.push(`/verificar?ci=${cleaned.replace(/\D/g, "")}`);
    else if (isRUC) router.push(`/score?ruc=${cleaned}`);
    else router.push(`/buscar?q=${encodeURIComponent(cleaned)}`);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && buscar()}
          placeholder="CI, RUC, producto o empresa..."
          className="flex-1 h-12 px-4 rounded-xl border-2 border-[#D4D2C9] bg-white text-sm focus:outline-none focus:border-[#C96442] transition-colors"
        />
        <button onClick={buscar} disabled={!q.trim()} className="h-12 w-12 rounded-xl bg-[#C96442] hover:bg-[#B5583A] text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0">
          <Search className="h-5 w-5" />
        </button>
      </div>
      <p className="text-xs text-[#87867F] mt-2">CI · RUC · Producto · Empresa · Probar gratis</p>
    </div>
  );
}
