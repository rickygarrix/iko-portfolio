import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function GET() {
  try {
    const result = await resend.emails.send({
      from: "noreply@send.otnv.jp",
      to: "chloerickyb@gmail.com",
      subject: "テスト送信：Resend ✉️",
      html: "<p>設定完了！noreply@send.otnv.jp から送信成功🎉</p>",
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}