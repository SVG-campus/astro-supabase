import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
  const formData = await request.formData();
  const method = formData.get("method")?.toString();

  if (method === "password") {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    if (!email || !password) {
      return new Response("Email and password are required", { status: 400 });
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return new Response(error.message, { status: 500 });
    return redirect("/signin");
  }

  if (method === "phone") {
    const phone = formData.get("phone")?.toString();
    if (!phone) return new Response("Phone is required", { status: 400 });
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) return new Response(error.message, { status: 500 });
    return redirect("/signin");
  }

  return new Response("Invalid registration method", { status: 400 });
};
