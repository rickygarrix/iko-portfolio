"use client";

import { useParams, notFound } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Heart } from "lucide-react";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";
import { normalizePost, type RawPost } from "@/lib/normalizePost";
import type { Post } from "@/types/post";
import type { Store, TagCategory, TagValue } from "@/types/schema";
import type { User } from "@supabase/supabase-js";
import StorePostList from "@/components/posts/StorePostList";
import NewPostModal from "@/components/NewPostModal";
import EditPostModal from "@/components/EditPostModal";
import MapEmbed from "@/components/MapEmbed";
import StoreInfoTable from "@/components/stores/StoreInfoTable";
import InstagramSlider from "@/components/InstagramSlider";
import Image from "next/image";

export default function StoreDetailPage() {
  const { id } = useParams() as { id: string };

  const [selectedTab, setSelectedTab] = useState<"reviews" | "info">("reviews");
  const [storePosts, setStorePosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [tagValues, setTagValues] = useState<TagValue[]>([]);
  const [areaMap, setAreaMap] = useState<Record<string, string>>({});

  const { data: store, error, isLoading } = useSWR<Store>(
    id ? ["store", id] : null,
    async ([, id]) => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .single<Store>();

      if (error || !data) throw new Error(error?.message || "取得失敗");

      return data;
    }
  );

  useEffect(() => {
    const fetchTags = async () => {
      const { data: categories } = await supabase.from("review_tag_categories").select("*");
      const { data: values } = await supabase.from("review_tag_values").select("*");
      if (categories) setTagCategories(categories.map(c => ({ id: c.id, label: c.name_ja })));
      if (values) setTagValues(values);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data } = await supabase
        .from("area_translations")
        .select("area_id, name")
        .eq("locale", "ja");
      if (data) {
        const map = Object.fromEntries(data.map((a) => [a.area_id, a.name]));
        setAreaMap(map);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const refreshPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id,
        body,
        created_at,
        image_url,
        user_id,
        store:stores(id, name),
        user_profiles(id, name, avatar_url),
        post_likes(user_id),
        post_tag_values(
          tag_value:review_tag_values(
            id,
            name_ja,
            tag_category:review_tag_categories(id, name_ja)
          )
        )
      `)
      .eq("store_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("投稿取得失敗:", error.message);
      return;
    }

    if (data) {
      setStorePosts((data as RawPost[]).map(normalizePost));
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    refreshPosts();
    supabase
      .from("store_follows")
      .select("*", { count: "exact", head: true })
      .eq("store_id", id)
      .then(({ count }) => setFollowerCount(count ?? 0));
  }, [id, refreshPosts]);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("store_follows")
      .select("*")
      .eq("user_id", user.id)
      .eq("store_id", id)
      .then(({ data }) => setIsFollowing((data?.length ?? 0) > 0));
  }, [user, id]);

  const handleLike = async (postId: string) => {
    if (!user) return alert("ログインしてください");
    const post = storePosts.find((p) => p.id === postId);
    const liked = post?.post_likes?.some((l) => l.user_id === user.id);
    if (liked) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    }
    refreshPosts();
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", postId);
    refreshPosts();
  };

  const handleFollowToggle = async () => {
    if (!user) return alert("ログインしてください");
    if (isFollowing) {
      await supabase.from("store_follows").delete().eq("user_id", user.id).eq("store_id", id);
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
    } else {
      await supabase.from("store_follows").insert({ user_id: user.id, store_id: id });
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !store) return notFound();

  return (
    <div className="bg-[#FEFCF6] min-h-screen pt-12">
      <div className="max-w-[600px] mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-black">{store.name}</h1>
            <div className="text-xs text-zinc-600 mt-1">
              {store.area_id ? areaMap[store.area_id] : "エリア不明"}、
              {store.genre_ids?.join(", ")}
            </div>
          </div>
          {/* フォローボタン（ハート＋数） */}
          <button
            onClick={handleFollowToggle}
            className="flex items-center gap-1 h-6 px-0.5 justify-center"
          >
            <Heart
              size={14}
              fill={isFollowing ? "currentColor" : "none"}
              strokeWidth={1.5}
              className={isFollowing ? "text-[#4B5C9E]" : "text-[#4B5C9E]"}
            />
            <span className={isFollowing ? "text-[#4B5C9E] text-xs font-light" : "text-[#4B5C9E] text-xs font-light"}>
              {followerCount}
            </span>
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b mt-4">
          {["レビュー", "店舗情報"].map((label, idx) => (
            <button
              key={label}
              onClick={() => setSelectedTab(idx === 0 ? "reviews" : "info")}
              className={`flex-1 py-2 text-center font-semibold ${(idx === 0 && selectedTab === "reviews") ||
                (idx === 1 && selectedTab === "info")
                ? "border-b-2 border-slate-500 text-[#4B5C9E]"
                : "text-zinc-900 border-b border-zinc-200 font-light"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        {selectedTab === "reviews" ? (
          <StorePostList
            posts={storePosts}
            currentUserId={user?.id}
            onLike={handleLike}
            onEdit={setEditingPost}
            onDelete={handleDeletePost}
            showTags
            showImage
          />
        ) : (
          <div className="p-4 space-y-4">
            {store.map_embed && (
              <a href={store.map_link || "#"} target="_blank" rel="noopener noreferrer">
                <MapEmbed src={store.map_embed} title={`${store.name}の地図`} />
              </a>
            )}
            <p className="whitespace-pre-line text-sm leading-relaxed">{store.description}</p>
            <StoreInfoTable store={store} />
            <InstagramSlider
              posts={[
                store.store_instagrams,
                store.store_instagrams2,
                store.store_instagrams3,
              ].filter((url): url is string => Boolean(url))}
            />
            {store.website && (
              <a
                href={store.website}
                target="_blank"
                className="block mt-4 bg-black text-white rounded-lg px-4 py-2 text-center"
              >
                公式サイト →
              </a>
            )}
          </div>
        )}

        {/* 新規投稿ボタン */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-full max-w-[600px] flex justify-end pr-6 pointer-events-auto">
            <button
              onClick={() => {
                if (!user) return alert("ログインしてください");
                setShowModal(true);
              }}
              className="w-14 h-14 rounded-xl bg-[#F7F5EF] shadow-md flex items-center justify-center hover:opacity-80"
            >
              <Image
                src="/post/new.svg"
                alt="新規投稿"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>

        {showModal && user && (
          <NewPostModal
            user={user}
            stores={[store]}
            selectedStore={store}
            tagCategories={tagCategories}
            tagValues={tagValues}
            onPosted={() => {
              setShowModal(false);
              refreshPosts();
            }}
            onClose={() => setShowModal(false)}
          />
        )}

        {editingPost && (
          <EditPostModal
            post={editingPost}
            stores={[store]}
            tagCategories={tagCategories}
            tagValues={tagValues}
            onClose={() => setEditingPost(null)}
            onUpdated={async () => {
              setEditingPost(null);
              await refreshPosts();
            }}
          />
        )}
      </div>
    </div>
  );
}