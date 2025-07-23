"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StoreFollowSection from "@/components/sections/StoreFollowSection";
import TabNavigation from "@/components/sections/TabNavigation";
import PostSection from "@/components/sections/PostSection";
import EditPostModal from "@/components/EditPostModal";
import { normalizePost, type RawPost } from "@/lib/normalizePost";
import type { Post } from "@/types/post";
import type { Store } from "@/types/store";
import type { TagCategory, TagValue } from "@/types/schema";
import UserProfileCard from "@/components/users/UserProfileCard"

export default function UserProfilePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [userData, setUserData] = useState({
    name: "",
    avatarUrl: null as string | null,
    instagram: "",
    url: "",
    bio: "",
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [storeFollows, setStoreFollows] = useState<Store[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [areasMap, setAreasMap] = useState<Record<string, string>>({});
  const [tagCategories, setTagCategories] = useState<TagCategory[]>([]);
  const [tagValues, setTagValues] = useState<TagValue[]>([]);

  // 投稿
  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
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
      .eq("user_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    setPosts((data as RawPost[] ?? []).map(normalizePost));
  }, [id]);

  // いいね
  const fetchLikedPosts = useCallback(async () => {
    const { data: likesData } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", id);

    const likedPostIds = likesData?.map((like) => like.post_id) || [];
    if (likedPostIds.length === 0) {
      setLikedPosts([]);
      return;
    }

    const { data } = await supabase
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

    setLikedPosts((data as RawPost[] ?? []).map(normalizePost));
  }, [id]);

  // いいね・いいね解除
  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      alert("ログインが必要です");
      return;
    }

    const targetPosts = [...posts, ...likedPosts];
    const post = targetPosts.find((p) => p.id === postId);
    const isLiked = post?.post_likes?.some((l) => l.user_id === currentUserId);

    if (isLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId);

      const updateLikes = (list: Post[]) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, post_likes: (p.post_likes ?? []).filter((l) => l.user_id !== currentUserId) }
            : p
        );

      setPosts(updateLikes);
      setLikedPosts(updateLikes);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: currentUserId });

      const updateLikes = (list: Post[]) =>
        list.map((p) =>
          p.id === postId
            ? { ...p, post_likes: [...(p.post_likes ?? []), { user_id: currentUserId }] }
            : p
        );

      setPosts(updateLikes);
      setLikedPosts(updateLikes);
    }
  };

  // 削除
  const handleDeletePost = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return;
    await supabase.from("posts").delete().eq("id", postId);
    await fetchPosts();
  };

  // フォロー店舗
  const fetchFollowedStores = useCallback(async () => {
    const { data } = await supabase
      .from("store_follows")
      .select("store:stores(*)")
      .eq("user_id", id);

    const stores = (data ?? [])
      .map((f) => (Array.isArray(f.store) ? f.store[0] : f.store))
      .filter((s): s is Store => !!s);

    setStoreFollows(stores);
  }, [id]);

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

  // 初回
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", id)
        .single();

      setUserData({
        name: profile?.name ?? "（未設定）",
        url: profile?.url ?? "",
        avatarUrl: profile?.avatar_url ?? null, // ← ここがポイント
        instagram: profile?.instagram ?? "",
        bio: profile?.bio ?? "",
      });

      await Promise.all([
        fetchPosts(),
        fetchLikedPosts(),
        fetchFollowedStores(),
        fetchStores(),
        fetchTagCategories(),
        fetchTagValues(),
        fetchAreas(),
      ]);
    };

    if (id) {
      fetchUserAndData();
    }
  }, [id, fetchPosts, fetchLikedPosts, fetchFollowedStores]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />
      <main className="px-4 py-12 w-full max-w-[600px] mx-auto bg-white">
        {/* ユーザー情報 */}
        <div className="max-w-[600px] mx-auto">
          <UserProfileCard
            name={userData.name}
            avatarUrl={userData.avatarUrl}
            bio={userData.bio}
            instagram={userData.instagram}
            url={userData.url}
          />
        </div>

        {/* タブ */}
        <TabNavigation
          activeTab={activeTab}
          onChange={(index) => setActiveTab(index)}
          postCount={posts.length}
          likedCount={likedPosts.length}
          storeFollowCount={storeFollows.length}
        />

        {/* コンテンツ（600px制限を追加） */}
        <div className="mt-6 space-y-4 max-w-[600px] mx-auto">
          {activeTab === 0 && (
            <PostSection
              userId={currentUserId || ""}
              type="posts"
              posts={posts}
              onLike={handleLike}
              onEdit={setEditingPost}
              onDelete={handleDeletePost}
            />
          )}
          {activeTab === 1 && (
            <PostSection
              userId={currentUserId || ""}
              type="likes"
              posts={likedPosts}
              onLike={handleLike}
              onEdit={() => { }}
              onDelete={() => { }}
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

        {/* 編集モーダル */}
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