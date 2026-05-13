import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: status } = await supabase.from("scraper_status").select("*").order("fuente");
    const { data: recentSyncs } = await supabase.from("sync_logs").select("*").order("timestamp", { ascending: false }).limit(5);
    const { count: totalRequests } = await supabase.from("api_requests").select("*", { count: "exact", head: true });

    return NextResponse.json({
      fuentes: status ?? [],
      ultimos_syncs: recentSyncs ?? [],
      total_requests: totalRequests ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
