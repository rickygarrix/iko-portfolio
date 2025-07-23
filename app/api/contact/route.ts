import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();

  const { error } = await supabase.from("contacts").insert({
    name,
    email,
    subject,
    message,
  });

  if (error) {
    console.error("🔥 DB保存エラー:", error);
    return NextResponse.json({ error: "DB保存失敗" }, { status: 500 });
  }

  return NextResponse.json({ message: "送信成功" });
}