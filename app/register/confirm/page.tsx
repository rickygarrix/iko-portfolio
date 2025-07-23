"use client";

import { useRouter } from "next/navigation";
import { usePendingStore } from "@/lib/store/pendingStore";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function StoreRegisterConfirmPage() {
  const router = useRouter();
  const pendingStore = usePendingStore((state) => state.pendingStore);
  const resetPendingStore = usePendingStore((state) => state.resetPendingStore);

  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      } else {
        setUserId(null);
      }
    };
    fetchUser();
  }, []);

  const handleRegister = async () => {
    if (!userId) {
      setError("ログインが必要です。");
      return;
    }

    try {
      const { data, error: insertError } = await supabase
        .from("stores")
        .insert([
          {
            name: pendingStore.name,
            genre_ids: pendingStore.genre_ids,
            address: pendingStore.address,
            website: pendingStore.website_url,
            instagram: pendingStore.instagram_url,
            user_id: userId,
            is_published: false,
            is_pending: true,
            is_deleted: false,
            is_recommended: false,
          },
        ])
        .select();

      if (insertError || !data || data.length === 0) {
        throw new Error("店舗データの登録に失敗しました");
      }

      resetPendingStore();
      router.push("/register/thanks");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8 text-gray-800">
          <h1 className="text-2xl font-bold text-center mb-6">店舗情報確認</h1>

          <div className="space-y-4 mb-8">
            <Item title="店名" value={pendingStore.name} />
            <Item title="ジャンル" value={pendingStore.genre_ids.join(", ")} />
            <Item title="住所" value={pendingStore.address} />
            <Item title="公式サイトURL" value={pendingStore.website_url} />
            <Item title="Instagramアカウント" value={pendingStore.instagram_url} />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-semibold mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              onClick={handleRegister}
              className="w-full bg-[#1F1F21] text-white rounded p-3 hover:bg-[#333]"
            >
              登録する
            </button>
            <button
              onClick={handleBack}
              className="w-full border border-gray-400 text-gray-700 rounded p-3 hover:bg-gray-100"
            >
              修正する
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

function Item({ title, value }: { title: string; value?: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-gray-800 text-lg whitespace-pre-wrap">{value || "ー"}</p>
    </div>
  );
}