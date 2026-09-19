"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
  }

  // Only follow `next` if it's a same-site admin path -- it comes from a
  // query param, so anything else (an absolute URL, a protocol-relative
  // "//evil.com") is an open-redirect risk and gets ignored.
  redirect(next.startsWith("/admin/") ? next : "/admin/projects");
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || email } },
  });

  if (error) {
    redirect(`/admin/signup?error=${encodeURIComponent(error.message)}`);
  }

  // No session means email confirmation is required before the account can
  // sign in -- redirecting to /admin/projects here would just bounce them
  // straight back to login with no explanation.
  if (!data.session) {
    redirect("/admin/signup?confirmEmail=1");
  }

  redirect("/admin/projects");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// Supabase intentionally doesn't reveal whether the email has an account
// (avoids leaking which emails are registered), so this always redirects to
// the same "check your email" state regardless of whether it actually sent.
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/admin/forgot-password");

  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${protocol}://${host}/admin/auth/confirm?next=/admin/reset-password`,
  });

  redirect("/admin/forgot-password?sent=1");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    redirect(`/admin/reset-password?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/admin/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/projects");
}
