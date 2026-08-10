import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exchanges an emailed code (password recovery, email confirmation) for a
// session, then lands the user in the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requested = searchParams.get("next");
  // Only same-site paths — never let ?next= bounce the user off the origin.
  const next = requested && /^\/(?!\/)/.test(requested) ? requested : "/home";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
