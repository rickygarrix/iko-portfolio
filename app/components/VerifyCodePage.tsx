"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VerifyCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await fetch("/api/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "認証に失敗しました");
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/mypage");
    }, 1500);
  };

  // emailがURLにない場合はリダイレクト
  useEffect(() => {
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4">
        <form
          onSubmit={handleVerify}
          className="w-full max-w-sm bg-white p-6 rounded shadow space-y-4"
        >
          <h1 className="text-xl font-bold text-center">認証コード入力</h1>

          <input
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="6桁のコード"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border px-3 py-2 rounded text-center tracking-widest text-xl"
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center">
              認証に成功しました。マイページに移動します…
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-2 rounded hover:opacity-90"
          >
            {isLoading ? "確認中..." : "認証する"}
          </button>
        </form>
      </main>

      <Footer
        locale="ja"
        messages={{
          search: "検索",
          map: "地図",
          contact: "お問い合わせ",
          terms: "利用規約",
          privacy: "プライバシー",
          copyright: "© 2025 Otonavi",
        }}
      />
    </div>
  );
}