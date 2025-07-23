"use client";

import { useRouter } from "next/navigation";

export default function ResetPasswordCompletePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
      <div className="w-96 px-4 py-10 bg-white inline-flex flex-col justify-start items-center gap-10 rounded-2xl shadow">
        {/* タイトルとメッセージ */}
        <div className="w-full flex flex-col justify-start items-center gap-2">
          <h1 className="w-full text-center text-zinc-900 text-lg font-semibold tracking-widest">
            再設定完了
          </h1>
          <p className="text-sm text-zinc-700 font-light text-center leading-relaxed">
            新しいパスワードを設定しました。
            <br />
            改めてログインしてください。
          </p>
        </div>

        {/* ボタン */}
        <div className="w-full flex justify-center items-center">
          <button
            onClick={() => router.push("/login")}
            className="w-full h-12 px-4 bg-zinc-900 text-white rounded-lg outline outline-1 outline-offset-[-0.5px] outline-zinc-900 hover:opacity-90 transition"
          >
            ログインへ
          </button>
        </div>
      </div>
    </div>
  );
}