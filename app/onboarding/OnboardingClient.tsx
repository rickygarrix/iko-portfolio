"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

const PREFECTURES = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];
const GENDERS = ["男性", "女性", "その他", "回答しない"];
const OCCUPATIONS = ["会社員", "公務員", "自営業", "経営者・役員", "学生", "主婦・主夫", "無職", "定年退職", "その他"];
const BIRTH_YEARS = Array.from({ length: 2025 - 1925 + 1 }, (_, i) => 1925 + i).reverse();

const generateAvatarUrl = (name: string) => {
  const initial = name.charAt(0);
  const colors = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
    <rect width='100%' height='100%' rx='64' ry='64' fill='${color}' />
    <text x='50%' y='50%' font-size='64' text-anchor='middle' dominant-baseline='central' fill='white' font-family='sans-serif'>${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthYear, setBirthYear] = useState(2000);
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [loading, setLoading] = useState(false);

  const password = typeof window !== "undefined" ? localStorage.getItem("signup_password") : "";

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("情報が不足しています。最初からやり直してください。");
      router.push("/signup");
      return;
    }
    if (!name.trim() || !gender || !birthYear || !prefecture || !city.trim() || !occupation) {
      alert("すべての項目を入力してください。");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name: name.trim(),
        avatar_url: generateAvatarUrl(name.trim()),
        gender,
        birth_year: birthYear,
        prefecture,
        city: city.trim(),
        occupation,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || "ユーザー作成に失敗しました");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert("ログインに失敗しました: " + error.message);
      setLoading(false);
      return;
    }
    localStorage.removeItem("signup_password");
    router.push("/onboarding-complete");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pt-[48px]">
      <Header />
      <main className="flex-grow px-4 py-10 flex justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-10">
          <h1 className="text-lg font-semibold tracking-widest">新規登録完了</h1>
          <p className="text-sm text-zinc-900 text-center">
            新規登録が完了しました！続けてあなたについて教えてください。あとからいつでも変更できます。
          </p>

          <div className="w-full flex flex-col gap-8">
            {/* 表示名 */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-zinc-900 flex items-center gap-1">
                表示名<span className="text-rose-700">*</span>
                <span className="text-white text-[10px] px-1 bg-[#4B5C9E] rounded-sm">公開</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 bg-white rounded outline outline-1 outline-zinc-200"
              />
            </div>

            {/* 生年・地域・性別・職業 */}
            <div className="flex flex-col gap-8">
              {/* 生年 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-900 flex items-center gap-1">
                  生年<span className="text-rose-700">*</span>
                  <span className="text-white text-[10px] px-1 bg-zinc-600 rounded-sm">非公開</span>
                </label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="w-full p-2 bg-white rounded outline outline-1 outline-zinc-200"
                >
                  {BIRTH_YEARS.map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
              </div>

              {/* 地域 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-900 flex items-center gap-1">
                  住んでいる地域<span className="text-rose-700">*</span>
                  <span className="text-white text-[10px] px-1 bg-zinc-600 rounded-sm">非公開</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={prefecture}
                    onChange={(e) => setPrefecture(e.target.value)}
                    className="flex-1 p-2 bg-white rounded outline outline-1 outline-zinc-200"
                  >
                    <option value="">都道府県</option>
                    {PREFECTURES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="市区町村"
                    className="flex-1 p-2 bg-white rounded outline outline-1 outline-zinc-200 placeholder-zinc-200"
                  />
                </div>
              </div>

              {/* 性別 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-900 flex items-center gap-1">
                  性別<span className="text-rose-700">*</span>
                  <span className="text-white text-[10px] px-1 bg-zinc-600 rounded-sm">非公開</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 bg-white rounded outline outline-1 outline-zinc-200"
                >
                  <option value="">選択してください</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* 職業 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-900 flex items-center gap-1">
                  職業<span className="text-rose-700">*</span>
                  <span className="text-white text-[10px] px-1 bg-zinc-600 rounded-sm">非公開</span>
                </label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full p-2 bg-white rounded outline outline-1 outline-zinc-200"
                >
                  <option value="">選択してください</option>
                  {OCCUPATIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-12 min-w-48 px-4 bg-zinc-900 rounded-lg outline outline-1 outline-zinc-900 text-white text-base font-light hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "送信中..." : "保存"}
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
