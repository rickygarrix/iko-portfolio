import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const resendApiKey = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("Auth Hook Received:", body);

    const user = body.user;
    const email = user?.email;
    const username = user?.user_metadata?.name ?? "ユーザー";
    const confirmation_link = body?.confirmation_link;

    if (!resendApiKey || !email || !confirmation_link) {
      console.error("Missing required data:", { email, confirmation_link });
      return new Response("Missing required data", { status: 400 });
    }

    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Otonavi <noreply@otnv.jp>",
        to: [email],
        subject: "【オトナビ】ログインリンクのお知らせ",
        html: `
          <p>${username}さん</p>
          <p>以下のリンクからログインしてください：</p>
          <p><a href="${confirmation_link}">${confirmation_link}</a></p>
          <p>このリンクは一定時間で無効になります。</p>
        `,
      }),
    });

    if (!result.ok) {
      const text = await result.text();
      console.error("Resend failed:", text);
      return new Response("Failed to send email", { status: 500 });
    }

    console.log("Email sent to", email);
    return new Response("Email sent", { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});