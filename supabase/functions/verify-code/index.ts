// supabase/functions/verify-code/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return new Response("Missing fields", { status: 400 });
    }

    // Supabase REST API 経由で `auth_codes` テーブルを確認
    const checkRes = await fetch(`${supabaseUrl}/rest/v1/auth_codes?email=eq.${email}&code=eq.${code}&used=is.false`, {
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=representation",
      },
    });

    const records = await checkRes.json();

    if (!Array.isArray(records) || records.length === 0) {
      return new Response("Invalid or expired code", { status: 401 });
    }

    // ユーザーを作成（メール＆パスワード）
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!signupRes.ok) {
      const msg = await signupRes.text();
      console.error("Signup failed:", msg);
      return new Response("Signup failed", { status: 500 });
    }

    // コードを used=true に更新
    const recordId = records[0].id;
    await fetch(`${supabaseUrl}/rest/v1/auth_codes?id=eq.${recordId}`, {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey!,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ used: true }),
    });

    return new Response("Signup successful", { status: 200 });
  } catch (e) {
    console.error("Error in verify-code:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
});