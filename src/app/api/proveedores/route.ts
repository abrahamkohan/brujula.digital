import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }
  const res = await fetch(DNCP_AUTH, { method: "POST", headers: { Authorization: `Basic ${RT}` }, signal: AbortSignal.timeout(5000) });
  const data = await res.json();
  cachedToken = { token: data.access_token, expires: Date.now() + 14 * 60 * 1000 };
  return cachedToken.token;
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search");
  if (!search) return NextResponse.json({ proveedores: [] });

  try {
    const token = await getToken();
    const res = await fetch(
      `${DNCP_API}/search/suppliers?name=${encodeURIComponent(search)}&items_per_page=10`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
    ).catch(() => null);

    if (!res?.ok) return NextResponse.json({ proveedores: [] });

    const text = await res.text();
    if (!text) return NextResponse.json({ proveedores: [] });

    const data = JSON.parse(text);
    const results = data.releases ?? data.results ?? data.suppliers ?? [];

    const proveedores = results.slice(0, 10).map((s: Record<string, unknown>) => ({
      id: (s as { id?: string }).id ?? (s as { identifier?: { id?: string } }).identifier?.id ?? "",
      name: (s as { name?: string }).name ?? "Sin nombre",
      ruc: ((s as { identifier?: { id?: string } }).identifier?.id ?? "").replace("PY-RUC-", ""),
      contratos: (s as { contracts_count?: number }).contracts_count ?? 0,
      monto_total: (s as { total_awarded?: number }).total_awarded ?? 0,
    }));

    return NextResponse.json({ proveedores });
  } catch {
    return NextResponse.json({ error: "No disponible" }, { status: 500 });
  }
}
