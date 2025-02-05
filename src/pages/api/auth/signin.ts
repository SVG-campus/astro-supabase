import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const provider = formData.get("provider")?.toString();
  const method = formData.get("method")?.toString();

  // OAuth flow for sign in
  if (provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: import.meta.env.DEV
          ? "http://localhost:4321/api/auth/callback"
          : "https://astro-supabase-auth.vercel.app/api/auth/callback",
      },
    });
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    return redirect(data.url);
  }

  // Email sign in (passwordless)
  if (method === "email") {
    const email = formData.get("email")?.toString();
    if (!email) {
      return new Response("Email is required", { status: 400 });
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    return redirect("/dashboard");
  }

  // Phone sign in (passwordless)
  if (method === "phone") {
    const phone = formData.get("phone")?.toString();
    if (!phone) {
      return new Response("Phone is required", { status: 400 });
    }
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      return new Response(error.message, { status: 500 });
    }
    return redirect("/dashboard");
  }

  return new Response("Invalid sign in method", { status: 400 });
};
