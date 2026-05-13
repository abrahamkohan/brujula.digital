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
  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q) return NextResponse.json({ error: "Especificá nombre o RUC" }, { status: 400 });

  try {
    const token = await getToken();
    const isRUC = /\d/.test(q);
    let supplier = null;
    let contratos = 0;
    let monto = 0;

    if (isRUC) {
      const cleaned = q.replace(/\D/g, "");
      const ruc = `${cleaned.slice(0, -1)}-${cleaned.slice(-1)}`;
      const [sr, cr] = await Promise.all([
        fetch(`${DNCP_API}/suppliers/${ruc}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
        fetch(`${DNCP_API}/search/processes?awards.suppliers.id=PY-RUC-${ruc}&items_per_page=5&tipo_fecha=adjudicacion&fecha_desde=2023-01-01`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null),
      ]);
      if (sr?.ok) { const t = await sr.text(); if (t) { const s = JSON.parse(t); supplier = { nombre: s.name, contratos: 0, monto: 0 }; } }
      if (cr?.ok) {
        const t = await cr.text(); if (t) {
          const d = JSON.parse(t); contratos = (d.records ?? []).length;
          const releases = await Promise.all((d.records ?? []).slice(0, 5).map(async (r: { releases?: Array<{ url?: string }> }) => {
            const rel = r.releases?.[0]; if (!rel?.url) return 0;
            try {
              const rr = await fetch(rel.url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(3000) });
              const rt = await rr.text();
              if (!rt) return 0;
              const rd = JSON.parse(rt); const inner = rd.releases?.[0] ?? rd;
              return inner.awards?.[0]?.value?.amount ?? 0;
            } catch { return 0; }
          }));
          monto = releases.reduce((s: number, v: number) => s + v, 0);
        }
      }
    } else {
      const sr = await fetch(`${DNCP_API}/search/suppliers?name=${encodeURIComponent(q)}&items_per_page=1`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) }).catch(() => null);
      if (sr?.ok) { const t = await sr.text(); if (t) { const d = JSON.parse(t); const s = (d.releases ?? d.results ?? [])[0]; if (s) supplier = { nombre: s.name, contratos: 0, monto: 0 }; } }
    }

    return NextResponse.json(supplier ? { ...supplier, contratos, monto } : { error: "No encontrado" });
  } catch { return NextResponse.json({ error: "Error" }, { status: 500 }); }
}
