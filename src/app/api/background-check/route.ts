import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;
  const res = await fetch(DNCP_AUTH, { method: "POST", headers: { Authorization: `Basic ${RT}` }, signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ error: "Ingresá una CI o RUC válido" }, { status: 400 });
  }

  const isCI = /^\d{5,8}$/.test(q.replace(/\D/g, ""));
  const isRUC = /\d{6,8}-\d/.test(q) || /^\d{6,9}$/.test(q.replace(/\D/g, ""));
  
  if (!isCI && !isRUC) {
    return NextResponse.json({ error: "Formato no reconocido. Ingresá CI o RUC." }, { status: 400 });
  }

  const supabase = await createClient();
  let funcionario = null;
  let empresa = null;

  try {
    // Search funcionarios
    if (isCI) {
      const ci = q.replace(/\D/g, "");
      const { data: func } = await supabase
        .from("funcionarios")
        .select("cedula,nombre,apellido,organismo,cargo,estado,ultima_actualizacion")
        .eq("cedula", ci)
        .maybeSingle();
      funcionario = func;
    }

    // Search DNCP if RUC
    if (isRUC) {
      const token = await getToken();
      const cleaned = q.replace(/\D/g, "");
      const ruc = `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;

      const [supplierRes, contractsRes] = await Promise.all([
        fetch(`${DNCP_API}/suppliers/${ruc}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
        fetch(`${DNCP_API}/search/processes?awards.suppliers.id=PY-RUC-${ruc}&items_per_page=5&tipo_fecha=adjudicacion&fecha_desde=2024-01-01`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
      ]);

      if (supplierRes?.ok) {
        const text = await supplierRes.text();
        if (text) {
          try {
            const s = JSON.parse(text);
            empresa = {
              nombre: s.name ?? "No disponible",
              ruc: q,
              categorias: (s.details?.categories ?? []).map((c: { description: string }) => c.description),
              sanciones: (s.details?.sanctions ?? []).map((sanc: { type: string }) => sanc.type),
              contratos: 0,
            };
          } catch { /* ignore */ }
        }
      }

      if (contractsRes?.ok && empresa) {
        const text = await contractsRes.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            empresa.contratos = (data.records ?? []).length;
          } catch { /* ignore */ }
        }
      }
    }
  } catch { /* partial data is OK */ }

  return NextResponse.json({
    consulta: q,
    tipo: isCI ? "CI" : "RUC",
    funcionario,
    empresa,
    encontrado: !!(funcionario || empresa),
  });
}
