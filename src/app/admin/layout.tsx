import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { Home, Database, Calendar, Plus, Shield, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Brújula Digital",
  robots: "noindex, nofollow",
};

interface NavLink {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const navLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/fuentes", label: "Fuentes", icon: Database },
  { href: "/admin/eventos", label: "Eventos", icon: Calendar },
  { href: "/admin/eventos/nuevo", label: "+ Nuevo", icon: Plus },
  { href: "/admin/directorios", label: "Directorios", icon: Building2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#D4D2C9]">
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#C96442]" />
            <span className="text-sm font-bold text-[#1F1E1D] tracking-tight">
              Bru<span className="text-[#C96442] italic">jula</span>
            </span>
            <span className="text-xs text-[#87867F] ml-0.5">/admin</span>
          </Link>

          <nav className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#5C5B57] hover:text-[#1F1E1D] hover:bg-[#F5F4ED] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}
