import { NextRequest, NextResponse } from "next/server";

const DNCP_AUTH = "https://contrataciones.gov.py/datos/oauth/token";
const DNCP_API = "https://contrataciones.gov.py/datos/api/v3/doc";
const RT = "MGM3ZWNhNGQtYjc1NS00MjMxLThiZDItOGVjY2IxNDY3M2UxOjVmZDVmOGFjLTkzYzAtNDFlMC04YTdiLWIzYjcwNDM4YTdlMA==";

let cachedToken: { token: string; expires: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }
  const res = await fetch(DNCP_AUTH, {
    method: "POST",
    headers: { Authorization: `Basic ${RT}` },
  });
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expires: Date.now() + 14 * 60 * 1000, // 14 min (token lives 15 min)
  };
  return cachedToken.token;
}

interface CatalogItem {
  id: string;
  description: string;
  classification?: { id: string; description: string };
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const year = request.nextUrl.searchParams.get("year") ?? "2025";
  const search = request.nextUrl.searchParams.get("search");

  try {
    const token = await getToken();

    // If searching by name, find catalog items first
    if (search) {
      const url = `${DNCP_API}/search/classification?items_per_page=10&name=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();
      if (!text) return NextResponse.json({ items: [] });

      try {
        const data = JSON.parse(text);
        return NextResponse.json({
          items: data.releases ?? data.items ?? data.results ?? [],
          search,
        });
      } catch {
        return NextResponse.json({ items: [], error: "No se pudo procesar la respuesta" });
      }
    }

    // If code provided, get awarded prices
    if (code) {
      const url = `${DNCP_API}/search/awarded-items/${code}/amount/${year}?items_per_page=50`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const text = await res.text();

      if (res.status === 404 || !text) {
        return NextResponse.json({ items: [], code, year, message: "Sin datos para este código" });
      }

      try {
        const data = JSON.parse(text);
        const awards = data.releases ?? data.items ?? [];

        // Calculate stats
        const amounts = awards
          .map((a: Record<string, unknown>) => {
            const amount = (a as { award?: { value?: { amount?: number } } }).award?.value?.amount
              ?? (a as { amount?: number }).amount
              ?? (a as { value?: { amount?: number } }).value?.amount;
            return typeof amount === "number" ? amount : null;
          })
          .filter((a: unknown): a is number => a !== null)
          .sort((a: number, b: number) => a - b);

        const stats =
          amounts.length > 0
            ? {
                min: amounts[0],
                max: amounts[amounts.length - 1],
                avg: Math.round(amounts.reduce((s: number, v: number) => s + v, 0) / amounts.length),
                count: amounts.length,
                currency: "PYG",
              }
            : null;

        return NextResponse.json({
          items: awards.slice(0, 20),
          stats,
          code,
          year,
        });
      } catch {
        return NextResponse.json({ items: [], code, year, error: "Error procesando datos" });
      }
    }

    return NextResponse.json({ error: "Especificá code o search" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: "No pudimos consultar los datos en este momento." },
      { status: 500 }
    );
  }
}
