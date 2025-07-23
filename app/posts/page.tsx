"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import NewPostModal from "@/components/NewPostModal";
import EditPostModal from "@/components/EditPostModal";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Post } from "@/types/post";
import type { TagValue } from "@/types/schema";
import PostCard from "@/components/posts/PostCard";
import Image from "next/image";

export type RawPostInput = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  store?: { id: string; name: string } | { id: string; name: string }[] | null;
  post_likes?: { user_id: string }[];
  user_profiles?: {
    id: string;
    name?: string | null;
    avatar_url?: string | null;
  } | null;
  post_tag_values?: {
    tag_value?: {
      id?: string;
      name_ja?: string;
      tag_category?: {
        id?: string;
        name_ja?: string;
      };
    };
  }[];
};

type RawTag = {
  tag_value?: {
    id?: string;
    name_ja?: string;
    tag_category?: {
      id?: string;
      name_ja?: string;
    };
  };
};

export default function StorePostPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [tagCategories, setTagCategories] = useState<{ id: string; label: string }[]>([]);
  const [tagValues, setTagValues] = useState<TagValue[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [reportedPostIds, setReportedPostIds] = useState<string[]>([]);



  const fetchReportedPosts = async (userId: string) => {
    const { data } = await supabase.from("reports").select("post_id").eq("reporter_id", userId);
    if (data) setReportedPostIds(data.map((r) => r.post_id));
  };

  function isValidTag(
    tag: RawTag
  ): tag is {
    tag_value: {
      id: string;
      name_ja: string;
      tag_category: {
        id: string;
        name_ja: string;
      };
    };
  } {
    return (
      !!tag.tag_value?.id &&
      !!tag.tag_value.name_ja &&
      !!tag.tag_value.tag_category?.id &&
      !!tag.tag_value.tag_category.name_ja
    );
  }

  const fetchStores = async () => {
    const { data, error } = await supabase.from("stores").select("id, name");
    if (error) console.error("取得エラー:", error.message);
    if (data) setStores(data);
  };

  const fetchTagCategories = async () => {
    const { data } = await supabase.from("review_tag_categories").select("*");
    if (data) setTagCategories(data.map((d) => ({ id: d.id, label: d.name_ja })));
  };

  const fetchTagValues = async () => {
    const { data } = await supabase.from("review_tag_values").select("*");
    if (data) {
      const filtered = data.filter((tag) => tag.name_ja !== null && tag.name_ja !== undefined);
      setTagValues(filtered);
    }
  };

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
      id, body, created_at, user_id, image_url,
      store:stores!posts_store_id_fkey(id, name),
      post_likes(user_id),
      user_profiles(id, name, avatar_url),
      post_tag_values(
        tag_value:review_tag_values(
          id,
          name_ja,
          tag_category:review_tag_categories(id, name_ja)
        )
      )
    `)
      .eq("is_active", true) // ← これを追加！
      .order("created_at", { ascending: false })
      .returns<RawPostInput[]>();

    if (error) {
      console.error("投稿取得エラー:", error.message);
      return;
    }

    if (!data) return;

    const enrichedPosts: Post[] = data.map((post) => ({
      id: post.id,
      body: post.body,
      created_at: post.created_at,
      user_id: post.user_id,
      image_url: post.image_url ?? null,
      store: Array.isArray(post.store) ? post.store[0] : post.store ?? undefined,
      user: post.user_profiles
        ? {
          id: post.user_profiles.id,
          name: post.user_profiles.name ?? "退会ユーザー",
          avatar_url: post.user_profiles.avatar_url ?? "/default-avatar.svg",
        }
        : {
          id: post.user_id,
          name: "退会ユーザー",
          avatar_url: "/default-avatar.svg",
        },
      post_likes: post.post_likes ?? [],
      post_tag_values: (post.post_tag_values ?? [])
        .filter(isValidTag)
        .map((tag) => ({
          id: tag.tag_value.id,
          value: tag.tag_value.name_ja,
          tag_category: {
            id: tag.tag_value.tag_category.id,
            label: tag.tag_value.tag_category.name_ja,
          },
        })),
    }));

    setPosts(enrichedPosts);
  }, []);

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", postId);
    fetchPosts();
  };

  const handleReportPost = async (postId: string) => {
    if (!user) return alert("ログインしてください");
    if (!window.confirm("この投稿を運営に通報しますか？")) return;
    const { error } = await supabase.from("reports").insert({
      post_id: postId,
      reporter_id: user.id,
      reason: "",
    });
    if (error) {
      console.error("通報エラー:", error.message);
      alert("通報に失敗しました");
    } else {
      setReportedPostIds((prev) => [...prev, postId]);
      alert("通報しました。ご協力ありがとうございます。");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("ログインしてください");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    const alreadyLiked = post?.post_likes?.some((l) => l.user_id === user.id);
    if (alreadyLiked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  useEffect(() => {
    const initialize = async () => {
      const { data } = await supabase.auth.getUser();
      const loggedInUser = data.user;
      setUser(loggedInUser);
      if (loggedInUser) fetchReportedPosts(loggedInUser.id);
      fetchStores();
      fetchTagCategories();
      fetchTagValues();
      fetchPosts(); // ← ここで使っている
    };
    initialize();
  }, [fetchPosts]); // ← ★追加！！

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-14 px-4 sm:px-6 relative">
        {/* 新規投稿ボタン */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => {
              if (!user) return alert("ログインしてください");
              setShowModal(true);
            }}
            className="w-14 h-14 bg-stone-100 rounded-2xl shadow-[0px_2px_4px_rgba(0,0,0,0.25)] shadow-[0px_0px_10px_rgba(0,0,0,0.20)] flex items-center justify-center hover:opacity-80"
          >
            <Image
              src="/post/new.svg"
              alt="新規投稿"
              width={24}
              height={24}
            />
          </button>
        </div>

        {showModal && user && (
          <NewPostModal
            stores={stores}
            tagCategories={tagCategories}
            tagValues={tagValues}
            user={user}
            onClose={() => setShowModal(false)}
            onPosted={fetchPosts}
          />
        )}

        {editingPost && (
          <EditPostModal
            post={editingPost}
            stores={stores}
            tagCategories={tagCategories}
            tagValues={tagValues}
            onClose={() => setEditingPost(null)}
            onUpdated={async () => {
              await fetchPosts();
              setEditingPost(null);
            }}
          />
        )}

        <ul className="mt-2 mb-16 flex flex-col items-center space-y-6">
          {posts.map((post) => (
            <li key={post.id} className="w-full max-w-[700px]">
              <PostCard
                post={post}
                currentUserId={user?.id}
                onLike={handleLike}
                onEdit={setEditingPost}
                onDelete={handleDeletePost}
                onReport={handleReportPost}
                isReported={reportedPostIds.includes(post.id)}
                showImage
                showTags
              />
            </li>
          ))}
        </ul>
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