"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";

type Store = {
  id: string;
  name: string;
  address: string;
  genre_ids: string[];
  is_published: boolean;
  is_pending: boolean;
  is_deleted: boolean;
};

const ADMIN_EMAIL = "chloerickyb@gmail.com";

export default function StoreAdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [sortBy, setSortBy] = useState<"name">("name");
  const [filter, setFilter] = useState<"all" | "published" | "pending" | "deleted">("all");

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user && user.email === ADMIN_EMAIL) {
        setAuthorized(true);
      }
      setChecked(true);
    };
    checkAuth();
  }, []);

  // fetchStores を useCallback で定義
  const fetchStores = useCallback(async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order(sortBy, { ascending: true });

    if (error) {
      console.error(error);
    } else {
      const filtered = (data ?? []).filter((store: Store) => {
        if (filter === "published") return store.is_published && !store.is_deleted;
        if (filter === "pending") return store.is_pending && !store.is_deleted;
        if (filter === "deleted") return store.is_deleted;
        return true;
      });

      setStores(filtered);
    }
  }, [sortBy, filter]);

  // データ取得
  useEffect(() => {
    if (authorized) {
      fetchStores();
    }
  }, [authorized, fetchStores]);

  const toggleBoolean = async (id: string, key: keyof Store, value: boolean) => {
    const { error } = await supabase
      .from("stores")
      .update({ [key]: !value })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("更新に失敗しました");
    } else {
      fetchStores();
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("本当に削除しますか？");
    if (!confirm) return;

    const { error } = await supabase
      .from("stores")
      .update({ is_deleted: true })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("削除に失敗しました");
    } else {
      fetchStores();
    }
  };

  if (!checked) return null;
  if (!authorized) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />
      <main className="flex-grow pt-24 px-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">店舗管理</h1>

        {/* 並び替え & フィルター */}
        <div className="flex gap-6 mb-6 flex-wrap">
          <div className="flex gap-2 items-center">
            <p>並び替え:</p>
            <button
              className={sortBy === "name" ? "font-bold underline" : ""}
              onClick={() => setSortBy("name")}
            >
              店舗名
            </button>
          </div>

          <div className="flex gap-2 items-center">
            <p>フィルター:</p>
            {["all", "published", "pending", "deleted"].map((f) => (
              <button
                key={f}
                className={filter === f ? "font-bold underline" : ""}
                onClick={() => setFilter(f as typeof filter)}
              >
                {f === "all"
                  ? "全て"
                  : f === "published"
                    ? "公開中"
                    : f === "pending"
                      ? "申請中"
                      : "削除済"}
              </button>
            ))}
          </div>
        </div>

        {/* 一覧 */}
        <div className="space-y-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="border rounded p-4 bg-white shadow-sm space-y-2"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-lg">{store.name}</p>
                  <p className="text-sm text-gray-600">{store.address}</p>
                </div>
                <div>
                  <button
                    className="text-red-500 text-sm"
                    onClick={() => handleDelete(store.id)}
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* ステータス */}
              <div className="flex gap-4 text-sm">
                <ToggleButton
                  label="公開"
                  value={store.is_published}
                  onClick={() =>
                    toggleBoolean(store.id, "is_published", store.is_published)
                  }
                />
                <ToggleButton
                  label="申請中"
                  value={store.is_pending}
                  onClick={() =>
                    toggleBoolean(store.id, "is_pending", store.is_pending)
                  }
                />
                <ToggleButton
                  label="削除済"
                  value={store.is_deleted}
                  onClick={() =>
                    toggleBoolean(store.id, "is_deleted", store.is_deleted)
                  }
                />
              </div>
            </div>
          ))}
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

function ToggleButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-3 py-1 rounded border ${value ? "bg-blue-500 text-white" : "bg-gray-200"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}