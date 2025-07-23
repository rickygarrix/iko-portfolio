"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Post } from "@/types/post";
import type { Store } from "@/types/store";
import type { TagCategory, TagValue } from "@/types/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreFollowSection from "@/components/sections/StoreFollowSection";
import TabNavigation from "@/components/sections/TabNavigation";
import PostSection from "@/components/sections/PostSection";
import EditPostModal from "@/components/EditPostModal";
import { normalizePost, type RawPost } from "@/lib/normalizePost";
import UserProfileCard from "@/components/users/UserProfileCard"

export default function MyPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [storeFollows, setStoreFollows] = useState<Store[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [tagValues, setTagValues] = useState<TagValue[]>([]);
  const [areasMap, setAreasMap] = useState<Record<string, string>>({});
  const [isDataReady, setIsDataReady] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 投稿取得
  const fetchPosts = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, body, created_at, user_id, image_url,
        store:stores(id, name),
        user_profiles(id, name, avatar_url),
        post_likes(user_id),
        post_tag_values(
          tag_value:review_tag_values(
            id, name_ja, tag_category:review_tag_categories(id, name_ja)
          )
        )
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("投稿取得エラー:", error);
      return;
    }

    const normalized = (data as RawPost[] ?? []).map(normalizePost);
    setMyPosts(normalized);
  }, []);

  // いいね取得
  const fetchLikedPosts = useCallback(async (userId: string) => {
    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", userId);

    const likedPostIds = likesData?.map((like) => like.post_id) || [];
    if (likedPostIds.length === 0) {
      setLikedPosts([]);
      return;
    }

    const { data, error } = await supabase
      .from("posts")
      .select(`
        id, body, created_at, user_id, image_url,
        store:stores(id, name),
        user_profiles(id, name, avatar_url),
        post_likes(user_id),
        post_tag_values(
          tag_value:review_tag_values(
            id, name_ja, tag_category:review_tag_categories(id, name_ja)
          )
        )
      `)
      .in("id", likedPostIds);

    if (error) {
      console.error("likedPosts取得エラー:", error);
      return;
    }

    const enriched = (data as RawPost[] ?? []).map(normalizePost);
    setLikedPosts(enriched);
  }, []);

  // フォロー店舗
  const fetchFollowedStores = async (userId: string) => {
    const { data } = await supabase
      .from("store_follows")
      .select("store:stores(*)")
      .eq("user_id", userId);

    const stores = (data ?? [])
      .map((f) => (Array.isArray(f.store) ? f.store[0] : f.store))
      .filter((s): s is Store => !!s);

    setStoreFollows(stores);
  };

  const fetchStores = async () => {
    const { data } = await supabase.from("stores").select("*");
    if (data) setStores(data);
  };

  const fetchTagCategories = async () => {
    const { data } = await supabase.from("review_tag_categories").select("*");
    if (data) setTagCategories(data);
  };

  const fetchTagValues = async () => {
    const { data } = await supabase.from("review_tag_values").select("*");
    if (data) setTagValues(data);
  };

  const fetchAreas = async () => {
    const { data } = await supabase
      .from("area_translations")
      .select("area_id, name")
      .eq("locale", "ja");

    if (data) {
      const map = Object.fromEntries(data.map((a) => [a.area_id, a.name]));
      setAreasMap(map);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", postId);
    await fetchPosts(user?.id || "");
  };

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    const isLiked =
      myPosts.some((p) => p.id === postId && p.post_likes?.some((l) => l.user_id === user.id)) ||
      likedPosts.some((p) => p.id === postId && p.post_likes?.some((l) => l.user_id === user.id));

    if (isLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, post_likes: (p.post_likes ?? []).filter((l) => l.user_id !== user.id) }
            : p
        )
      );
      setLikedPosts((prev) => prev.filter((p) => p.id !== postId));
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });

      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, body, created_at, user_id, image_url,
          store:stores(id, name),
          user_profiles(id, name, avatar_url),
          post_likes(user_id),
          post_tag_values(
            tag_value:review_tag_values(
              id, name_ja, tag_category:review_tag_categories(id, name_ja)
            )
          )
        `)
        .eq("id", postId)
        .single();

      if (error || !data) {
        console.error("いいねした投稿の取得エラー", error);
        return;
      }

      const newPost = normalizePost(data as RawPost);

      setMyPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, post_likes: [...(p.post_likes ?? []), { user_id: user.id }] }
            : p
        )
      );
      setLikedPosts((prev) => [...prev, newPost]);
    }
  };

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: supaUser } = await supabase.auth.getUser();
      const activeUserId = supaUser?.user?.id ?? session.user.id ?? "";

      const fallbackUser: User = supaUser?.user ?? {
        id: activeUserId,
        aud: "authenticated",
        role: "authenticated",
        email: session.user.email ?? "",
        user_metadata: {},
        app_metadata: { provider: "email" },
        created_at: "",
      };

      setUser(fallbackUser);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", activeUserId)
        .single();

      setName(profile?.name ?? "");
      setUrl(profile?.url ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setBio(profile?.bio ?? "");

      await Promise.all([
        fetchPosts(activeUserId),
        fetchLikedPosts(activeUserId),
        fetchFollowedStores(activeUserId),
        fetchStores(),
        fetchTagCategories(),
        fetchTagValues(),
        fetchAreas(),
      ]);

      setIsDataReady(true);
    };

    fetchUserAndData();
  }, [fetchPosts, fetchLikedPosts, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />
      <main className="w-full py-12 flex justify-center">
        <div className="w-full max-w-[600px] px-4">
          <UserProfileCard
            name={name}
            avatarUrl={avatarUrl}
            bio={bio}
            url={url}
            onEditClick={() => router.push("/settings")}
          />

          <TabNavigation
            activeTab={activeTab}
            onChange={setActiveTab}
            postCount={myPosts.length}
            likedCount={likedPosts.length}
            storeFollowCount={storeFollows.length}
          />

          <div className="mt-6 space-y-4">
            {activeTab === 0 && (
              <PostSection
                userId={user?.id || ""}
                type="posts"
                posts={myPosts}
                onLike={handleLike}
                onEdit={setEditingPost}
                onDelete={handleDeletePost}
              />
            )}
            {activeTab === 1 && (
              <PostSection
                userId={user?.id || ""}
                type="likes"
                posts={likedPosts}
                onLike={handleLike}
                onEdit={setEditingPost}
                onDelete={handleDeletePost}
              />
            )}
            {activeTab === 2 && (
              <StoreFollowSection
                stores={storeFollows}
                fullStores={stores}
                areasMap={areasMap}
                onStoreClick={(storeId) => router.push(`/stores/${storeId}`)}
              />
            )}
          </div>

          {editingPost && isDataReady && (
            <EditPostModal
              post={editingPost}
              stores={stores}
              tagCategories={tagCategories}
              tagValues={tagValues}
              onClose={() => setEditingPost(null)}
              onUpdated={async () => {
                await fetchPosts(user?.id || "");
                setEditingPost(null);
              }}
            />
          )}
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