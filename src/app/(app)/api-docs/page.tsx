import { Card, CardContent } from "@/components/ui/card";
import { Code, Database, Zap } from "lucide-react";

const apis = [
  { method: "GET", path: "/api/verificar-funcionario?ci={cedula}", desc: "Verifica si una CI es funcionario público", example: "/api/verificar-funcionario?ci=1234567" },
  { method: "GET", path: "/api/precios-dncp?search={termino}&year={año}", desc: "Precios adjudicados en licitaciones DNCP", example: "/api/precios-dncp?search=combustible&year=2025" },
  { method: "GET", path: "/api/empresa-score?ruc={ruc}", desc: "Perfil de contrataciones de una empresa", example: "/api/empresa-score?ruc=80012345-7" },
  { method: "GET", path: "/api/empresa-score?name={nombre}", desc: "Buscar empresa por nombre", example: "/api/empresa-score?name=FOODVENTURES" },
  { method: "GET", path: "/api/background-check?q={ci|ruc}", desc: "Background check unificado (CI o RUC)", example: "/api/background-check?q=8361350" },
  { method: "GET", path: "/api/comparar?q={nombre|ruc}", desc: "Datos de proveedor para comparar", example: "/api/comparar?q=HIDRAULICA" },
  { method: "GET", path: "/api/export?source=funcionarios", desc: "Exportar datos en CSV", example: "/api/export?source=funcionarios" },
];

const ejemplos = [
  { code: `// Verificar funcionario
const res = await fetch('https://brujula.digital/api/verificar-funcionario?ci=1234567');
const data = await res.json();
// { encontrado: true, nombre: "Carlos", apellido: "González", organismo: "..." }`, desc: "Verificación por CI" },
  { code: `// Buscar precios de licitaciones
const res = await fetch('https://brujula.digital/api/precios-dncp?search=combustible&year=2025');
const data = await res.json();
// { awards: [...], stats: { min, avg, max, count } }`, desc: "Precios DNCP" },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#F5F4ED] font-sans">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white border border-[#D4D2C9] text-[#87867F] text-xs px-4 py-1.5 rounded-full mb-6 font-medium">
            <Code className="h-3.5 w-3.5 text-[#C96442]" /> Para desarrolladores
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#1F1E1D] leading-tight mb-3">API de Brujula</h1>
          <p className="text-[#5C5B57] max-w-md mx-auto">Accedé a datos públicos del Estado paraguayo desde tu aplicación. Sin API keys (por ahora).</p>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-[#1F1E1D] mb-4 flex items-center gap-2"><Database className="h-5 w-5 text-[#C96442]" /> Endpoints</h2>
          <div className="space-y-2">
            {apis.map(a => (
              <Card key={a.path} className="border-[#D4D2C9]">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <span className="bg-[#5A7D5A]/10 text-[#5A7D5A] text-xs font-bold px-2 py-1 rounded shrink-0">{a.method}</span>
                    <div className="flex-1 min-w-0">
                      <code className="text-sm font-mono text-[#C96442] break-all">{a.path}</code>
                      <p className="text-xs text-[#5C5B57] mt-1">{a.desc}</p>
                      <a href={a.example} className="text-[10px] text-[#87867F] hover:text-[#C96442] mt-1 block font-mono truncate">{a.example}</a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-[#1F1E1D] mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-[#C96442]" /> Ejemplos</h2>
          <div className="space-y-4">
            {ejemplos.map((e, i) => (
              <Card key={i} className="border-[#D4D2C9]">
                <CardContent className="pt-5 pb-5">
                  <p className="text-xs font-semibold text-[#87867F] mb-2 uppercase tracking-wider">{e.desc}</p>
                  <pre className="bg-[#1F1E1D] text-[#D4D2C9] text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">{e.code}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
