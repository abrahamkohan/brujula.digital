import Link from "next/link";
import { Compass, Calendar, Map } from "lucide-react";
import { PWARegister } from "@/components/pwa-register";
import { WeatherBadge } from "@/components/weather";
import { KohanTicker } from "@/components/kohan-ticker";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <PWARegister />
      {/* Nav mínimo */}
      <header className="bg-white border-b border-[#D4D2C9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#1F1E1D] flex items-center justify-center text-white group-hover:bg-[#C96442] transition-colors">
              <Compass className="h-4 w-4" />
            </div>
            <span className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1F1E1D] tracking-tight">
              Bru<span className="text-[#C96442] italic">jula</span>
            </span>
          </Link>

          <div className="flex-1" />
          <WeatherBadge />
          <nav className="flex items-center gap-1 ml-4">
            <Link href="/guia" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
              <Compass className="h-4 w-4" /> Guía
            </Link>
            <Link href="/eventos" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
              <Calendar className="h-4 w-4" /> Eventos
            </Link>
            <Link href="/itinerarios" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors">
              <Map className="h-4 w-4" /> <span className="hidden sm:inline">Itinerarios</span>
            </Link>
          </nav>
        </div>
      </header>

      {children}
      <KohanTicker />
    </div>
  );
}
