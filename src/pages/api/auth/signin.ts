import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const method = formData.get("method")?.toString();
  const provider = formData.get("provider")?.toString();

  if (provider) {
    // OAuth flow handled in the client side endpoint (if ever reached)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: import.meta.env.DEV
          ? "http://localhost:4321/api/auth/callback"
          : "https://astro-supabase-auth.vercel.app/api/auth/callback"
      }
    });
    if (error) return new Response(error.message, { status: 500 });
    return redirect(data.url);
  }

  if (method === "password") {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    if (!email || !password) {
      return new Response("Email and password are required", { status: 400 });
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return new Response(error.message, { status: 500 });
    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, {
      sameSite: "strict",
      path: "/",
      secure: true,
    });
    cookies.set("sb-refresh-token", refresh_token, {
      sameSite: "strict",
      path: "/",
      secure: true,
    });
    return redirect("/dashboard");
  }

  if (method === "phone") {
    const phone = formData.get("phone")?.toString();
    if (!phone) return new Response("Phone is required", { status: 400 });
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return new Response(error.message, { status: 500 });
    return redirect("/dashboard");
  }

  return new Response("Invalid sign in method", { status: 400 });
};
