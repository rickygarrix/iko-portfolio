"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Genre = { id: string; name: string };
type Area = { id: string; name: string };

export default function AdminMasterPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: genreData } = await supabase
        .from("review_tag_categories")
        .select("*")
        .order("name", { ascending: true });

      const { data: areaData } = await supabase
        .from("areas")
        .select("*")
        .order("name", { ascending: true });

      setGenres(genreData ?? []);
      setAreas(areaData ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (table: "review_tag_categories" | "areas", id: string) => {
    if (!confirm("本当に削除しますか？")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      alert("削除に失敗しました");
    } else {
      if (table === "review_tag_categories") {
        setGenres((prev) => prev.filter((g) => g.id !== id));
      } else {
        setAreas((prev) => prev.filter((a) => a.id !== id));
      }
    }
  };

  const handleAdd = async (table: "review_tag_categories" | "areas") => {
    const name = prompt("名前を入力してください");
    if (!name) return;

    const { data, error } = await supabase
      .from(table)
      .insert({ name })
      .select()
      .single();

    if (error) {
      alert("追加に失敗しました");
    } else {
      if (table === "review_tag_categories") {
        setGenres((prev) => [...prev, data]);
      } else {
        setAreas((prev) => [...prev, data]);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">ジャンル・エリア管理</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-10">
            {/* ジャンル管理 */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">ジャンル管理</h2>
                <button
                  className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-100"
                  onClick={() => handleAdd("review_tag_categories")}
                >
                  ＋ 追加
                </button>
              </div>
              <div className="space-y-2">
                {genres.map((g) => (
                  <div
                    key={g.id}
                    className="flex justify-between items-center bg-white p-3 rounded border shadow-sm"
                  >
                    <p>{g.name}</p>
                    <button
                      onClick={() => handleDelete("review_tag_categories", g.id)}
                      className="text-red-500 text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* エリア管理 */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">エリア管理</h2>
                <button
                  className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-100"
                  onClick={() => handleAdd("areas")}
                >
                  ＋ 追加
                </button>
              </div>
              <div className="space-y-2">
                {areas.map((a) => (
                  <div
                    key={a.id}
                    className="flex justify-between items-center bg-white p-3 rounded border shadow-sm"
                  >
                    <p>{a.name}</p>
                    <button
                      onClick={() => handleDelete("areas", a.id)}
                      className="text-red-500 text-sm"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
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