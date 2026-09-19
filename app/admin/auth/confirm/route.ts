import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

// Landing point for the link in a Supabase password-reset (or other OTP)
// email: exchanges the token in the URL for a real session, then hands off
// to `next` -- e.g. the reset-password form, which needs that session to
// call auth.updateUser().
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/admin/projects";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/admin/login?error=${encodeURIComponent("That link is invalid or has expired. Request a new one.")}`
  );
}
