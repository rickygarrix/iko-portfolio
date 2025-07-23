"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function WithdrawalSurveyPage() {
  const router = useRouter();

  const [usageFrequency, setUsageFrequency] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [improvement, setImprovement] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("withdrawal_userId");
    if (!userId) {
      router.replace("/withdrawal/auth");
    }
  }, [router]);

  const toggleReason = (value: string) => {
    setReasons((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("withdrawal_userId");
    if (!userId) {
      router.replace("/withdrawal/auth");
      return;
    }

    if (!usageFrequency || reasons.length === 0 || !improvement) {
      setError("全ての項目を入力してください");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/save-withdrawal-survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        usageFrequency,
        reasons,
        improvement,
        preservePosts: true,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("送信エラー=", data);
      alert(data?.error || "送信に失敗しました");
      setIsLoading(false);
      return;
    }

    router.push("/withdrawal/complete");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto p-4 space-y-6">
          <h1 className="text-center text-lg font-semibold tracking-widest text-zinc-900">
            退会アンケート
          </h1>
          <p className="text-sm text-center text-zinc-700">
            サービス改善のため、退会の理由を教えてください。
          </p>

          <div className="space-y-6">

            {/* 利用頻度 */}
            <div>
              <p className="text-sm text-zinc-900 font-light mb-2">
                利用頻度 <span className="text-rose-700">*</span>
              </p>
              <div className="space-y-3">
                {["週に数回", "月に数回", "年に数回", "ほとんど使わなかった"].map((option) => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <div className="relative w-5 h-5">
                      <input
                        type="radio"
                        name="frequency"
                        value={option}
                        checked={usageFrequency === option}
                        onChange={() => setUsageFrequency(option)}
                        className="peer appearance-none w-full h-full border border-[#1F1F21] rounded-full bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21]"
                      />
                      <span className="absolute top-1/2 left-1/2 w-[8px] h-[8px] rounded-full bg-white hidden peer-checked:block transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-base text-zinc-900 font-light">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 退会理由 */}
            <div>
              <p className="text-sm text-zinc-900 font-light mb-2">
                退会の主な理由 <span className="text-rose-700">*</span>
              </p>
              <div className="space-y-3">
                {[
                  "使う機会がなかった",
                  "情報が少なかった",
                  "使い方が難しかった",
                  "他に良いサービスを見つけた",
                  "生活環境が変わった",
                  "その他",
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      value={reason}
                      checked={reasons.includes(reason)}
                      onChange={() => toggleReason(reason)}
                      className="appearance-none w-5 h-5 border border-[#1F1F21] rounded bg-white checked:bg-[#4B5C9E] checked:border-[#1F1F21] bg-[url('/icons/check.svg')] bg-center bg-no-repeat"
                    />
                    <span className="text-base text-zinc-900 font-light">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 改善点 */}
            <div>
              <p className="text-sm text-zinc-900 font-light mb-2">
                改善してほしかった点 <span className="text-rose-700">*</span>
              </p>
              <textarea
                value={improvement}
                onChange={(e) => setImprovement(e.target.value)}
                className="w-full h-32 border border-zinc-200 rounded p-2 text-base text-zinc-900 font-light placeholder-zinc-400 resize-none"
                placeholder="自由にご記入ください"
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full h-12 bg-zinc-900 text-white text-base font-light rounded-lg hover:bg-zinc-800 disabled:opacity-50"
            >
              {isLoading ? "送信中..." : "次へ"}
            </button>
          </div>
        </div>
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