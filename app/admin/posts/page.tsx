"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";

type Post = {
  id: string;
  body: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
  store_id: string;
  is_hidden: boolean;
  user_profiles: {
    name: string;
  } | null;
  stores: {
    name: string;
  } | null;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          "*, user_profiles(name), stores(name)"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        setPosts(data);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleToggleHidden = async (id: string, hide: boolean) => {
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: hide })
      .eq("id", id);

    if (error) {
      alert("更新に失敗しました");
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_hidden: hide } : p))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert("削除に失敗しました");
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FEFCF6]">
      <Header />

      <main className="flex-grow pt-24 px-6 pb-10 text-gray-800">
        <h1 className="text-3xl font-bold mb-10 text-center">投稿管理</h1>

        {loading ? (
          <p className="text-center">読み込み中...</p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-4 bg-white rounded-lg border shadow space-y-2"
              >
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{post.stores?.name} に投稿</p>
                    <p className="text-sm text-gray-500">
                      ユーザー: {post.user_profiles?.name}
                    </p>
                    <p>{post.body}</p>
                    {post.image_url && (
                      <div className="w-32 h-32 relative">
                        <Image
                          src={post.image_url}
                          alt="投稿画像"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-500">
                      投稿日: {new Date(post.created_at).toLocaleString()}
                    </p>
                    <p
                      className={`text-sm ${post.is_hidden ? "text-red-500" : "text-green-600"
                        }`}
                    >
                      {post.is_hidden ? "非公開" : "公開中"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        handleToggleHidden(post.id, !post.is_hidden)
                      }
                      className="px-3 py-1 rounded border text-sm hover:bg-gray-100"
                    >
                      {post.is_hidden ? "公開にする" : "非公開にする"}
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-3 py-1 rounded border border-red-500 text-red-500 text-sm hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
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