"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/buscar", label: "Buscar" },
  { href: "/verificar", label: "Funcionarios" },
  { href: "/precios", label: "Precios" },
  { href: "/score", label: "Empresas" },
  { href: "/radar", label: "Radar" },
  { href: "/check", label: "Check" },
  { href: "/comparar", label: "Comparar" },
  { href: "/eventos", label: "Eventos" },
  { href: "/fincheck", label: "FinCheck" },
  { href: "/inmobiliario", label: "Inmuebles" },
  { href: "/agro", label: "Agro" },
  { href: "/portal", label: "Portal" },
  { href: "/entidades", label: "Entidades" },
  { href: "/proveedores", label: "Proveedores" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-[#D4D2C9] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#1F1E1D] tracking-tight shrink-0">
          Bru<span className="text-[#C96442] italic">jula</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link key={l.href} href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-[#C96442]/10 text-[#C96442]" : "text-[#5C5B57] hover:bg-[#F5F4ED] hover:text-[#1F1E1D]"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-[#5C5B57]">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#D4D2C9] bg-white px-4 py-3 space-y-1">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                  active ? "bg-[#C96442]/10 text-[#C96442]" : "text-[#5C5B57] hover:bg-[#F5F4ED]"
                }`}>
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
