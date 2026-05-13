import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="text-7xl font-bold text-[#C96442] mb-4">404</p>
        <h1 className="text-xl font-semibold text-[#1F1E1D] mb-2">Página no encontrada</h1>
        <p className="text-sm text-[#87867F] mb-6">La página que buscás no existe o fue movida.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C96442] text-white text-sm font-medium hover:bg-[#B5583A] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
