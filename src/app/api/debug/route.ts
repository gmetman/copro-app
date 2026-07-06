import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const url = process.env.SUPABASE_URL;
  const keyPresent = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  const { data, error } = await supabase.from("personnes").select("id").limit(1);

  return NextResponse.json({
    supabase_url: url ?? "MANQUANT",
    service_role_key_present: keyPresent,
    db_query_ok: !error,
    db_error: error?.message ?? null,
    row_count: data?.length ?? 0,
  });
}
