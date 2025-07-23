"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GENRES } from "@/constants/genres";
import { usePendingStore } from "@/lib/store/pendingStore";
import { useState } from "react";

export default function StoreRegisterPage() {
  const router = useRouter();
  const pendingStore = usePendingStore((state) => state.pendingStore);
  const setPendingStore = usePendingStore((state) => state.setPendingStore);

  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!pendingStore.name || pendingStore.genre_ids.length === 0 || !pendingStore.address) {
      setError("必須項目をすべて入力してください。");
      return;
    }
    router.push("/register/confirm");
  };

  return (
    <div className="min-h-screen bg-[#FEFCF6] flex flex-col">
      <Header />
      <main className="flex-grow pt-24 px-6 pb-10 max-w-xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-8">店舗登録フォーム</h1>
        <div className="space-y-6">
          <InputField label="店舗名 (必須)" value={pendingStore.name} onChange={(v) => setPendingStore({ name: v })} />
          <CheckboxGroup
            label="ジャンル (必須)"
            options={GENRES}
            selected={pendingStore.genre_ids}
            onChange={(v) => setPendingStore({ genre_ids: v })}
          />
          <InputField label="住所 (必須)" value={pendingStore.address} onChange={(v) => setPendingStore({ address: v })} />
          <InputField label="公式サイトURL" value={pendingStore.website_url} onChange={(v) => setPendingStore({ website_url: v })} />
          <InputField label="Instagram URL" value={pendingStore.instagram_url} onChange={(v) => setPendingStore({ instagram_url: v })} />

          {error && <p className="text-red-500 text-center">{error}</p>}

          <div className="space-y-4 mt-8">
            <button
              onClick={handleConfirm}
              className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
            >
              確認画面に進む
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

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o.key} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={o.key}
              checked={selected.includes(o.key)}
              onChange={(e) => {
                const updated = e.target.checked
                  ? [...selected, o.key]
                  : selected.filter((item) => item !== o.key);
                onChange(updated);
              }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}