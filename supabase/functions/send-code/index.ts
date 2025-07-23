// supabase/functions/send-code/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) return new Response("Missing email", { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分後

    // DB保存
    const { error } = await fetch(`${supabaseUrl}/rest/v1/auth_codes`, {
      method: "POST",
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        email,
        code,
        expires_at: expiresAt.toISOString(),
      }),
    });

    if (error) throw error;

    // Resend送信
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Otonavi <noreply@otnv.jp>",
        to: [email],
        subject: "【オトナビ】認証コード",
        html: `<p>以下の認証コードを入力してください：</p><h2>${code}</h2><p>10分以内にご入力ください。</p>`,
      }),
    });

    if (!result.ok) return new Response("メール送信失敗", { status: 500 });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("エラー発生", { status: 500 });
  }
});