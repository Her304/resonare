import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Keeps the Supabase free-tier project from auto-pausing after 7 days of
// inactivity. Vercel Cron hits this route on a schedule (see vercel.json) and
// it runs one tiny query so the database registers as active.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // When CRON_SECRET is set, Vercel Cron sends it as a Bearer token. Reject
  // anything that doesn't match so the endpoint can't be triggered by others.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // head:true → count only, no rows transferred. The cheapest way to touch the DB.
  const { error, count } = await supabase
    .from("concerts")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, pinged: new Date().toISOString(), concerts: count ?? 0 });
}
