"use client";

import { useRouter } from "next/navigation";

export default function ThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 pt-[80px]">
      <div className="max-w-[600px] w-full flex flex-col gap-10 items-center">
        <h1 className="text-lg font-semibold tracking-widest text-zinc-900">
          送信完了
        </h1>
        <p className="text-sm text-zinc-900 font-light text-center leading-relaxed">
          お問い合わせいただきありがとうございました。
          <br />
          内容を確認の上、担当者よりご連絡いたします。
        </p>

        <button
          onClick={() => router.push("/")}
          className="h-12 px-4 min-w-[192px] bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 text-white text-base font-light hover:opacity-90 flex justify-center items-center gap-2"
        >
          トップへ
        </button>
      </div>
    </div>
  );
}