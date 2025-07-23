// ✅ EditPostModal.tsx（NewPostModalのデザインと統一した完全版）

"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/types/post";
import Image from "next/image";

type Props = {
  post: Post;
  stores: Store[];
  tagCategories: TagCategory[];
  tagValues: TagValue[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

type Store = { id: string; name: string };
type TagCategory = { id: string; label: string };
type TagValue = { id: string; category_id: string; name_ja?: string };

export default function EditPostModal({
  post,
  stores,
  tagCategories,
  tagValues,
  onClose,
  onUpdated,
}: Props) {
  const [body, setBody] = useState(post.body || "");
  const [storeName, setStoreName] = useState(post.store?.name || "");
  const [storeId, setStoreId] = useState(post.store?.id || "");
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial: Record<string, string[]> = {};
    post.post_tag_values?.forEach((tag) => {
      const categoryId = tag.tag_category.id;
      const tagValueId = tag.id ?? "";
      if (tagValueId && categoryId) {
        if (!initial[categoryId]) initial[categoryId] = [];
        initial[categoryId].push(tagValueId);
      }
    });
    setSelectedTags(initial);
  }, [post]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const filteredStores = useMemo(() => {
    if (!storeName) return [];
    return stores.filter((s) => s.name.includes(storeName));
  }, [storeName, stores]);

  const handleSelectStore = (store: Store) => {
    setStoreName(store.name);
    setStoreId(store.id);
  };

  const handleToggle = (categoryId: string, tagId: string) => {
    setSelectedTags((prev) => {
      const current = prev[categoryId] || [];
      const exists = current.includes(tagId);
      if (exists) {
        return { ...prev, [categoryId]: current.filter((id) => id !== tagId) };
      } else {
        if (current.length >= 3) return prev;
        return { ...prev, [categoryId]: [...current, tagId] };
      }
    });
  };

  const handleUpdate = async () => {
    if (!body || !storeId) {
      alert("店舗とコメントは必須です");
      return;
    }
    setLoading(true);
    try {
      let newImageUrl = post.image_url ?? "";

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `${post.id}/${fileName}`;

        if (post.image_url) {
          const oldPath = post.image_url.split("/").slice(-2).join("/");
          await supabase.storage.from("post-images").remove([oldPath]);
        }

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, imageFile);

        if (uploadError) throw new Error("画像のアップロードに失敗しました");

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
        newImageUrl = urlData?.publicUrl || "";
      }

      await supabase
        .from("posts")
        .update({ body, store_id: storeId, image_url: newImageUrl })
        .eq("id", post.id);

      await supabase.from("post_tag_values").delete().eq("post_id", post.id);

      const inserts = Object.entries(selectedTags).flatMap(([categoryId, tagIds]) =>
        tagIds.map((tagId) => ({
          post_id: post.id,
          tag_category_id: categoryId,
          tag_value_id: tagId,
        }))
      );

      if (inserts.length > 0) {
        await supabase.from("post_tag_values").insert(inserts);
      }

      await onUpdated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("予期しないエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-md space-y-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold">投稿を編集</h2>

        <input
          type="text"
          value={storeId ? stores.find((s) => s.id === storeId)?.name ?? storeName : storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            setStoreId("");
          }}
          placeholder="店舗を入力"
          className="w-full border border-dashed border-zinc-300 px-3 py-2 rounded text-sm"
        />
        {storeName && !storeId && filteredStores.length > 0 && (
          <div className="border rounded mt-1">
            {filteredStores.map((s) => (
              <div
                key={s.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectStore(s)}
              >
                {s.name}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full border border-[#DA8C18] rounded p-2 text-sm"
            rows={4}
            maxLength={400}
            placeholder="感想をおしえて！"
          />
          <div className="absolute bottom-2 right-2 text-xs text-zinc-500">{body.length}/400</div>
        </div>

        <div
          className="relative w-full aspect-[16/9] border border-dashed border-zinc-300 rounded overflow-hidden cursor-pointer"
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="new"
              fill
              className="object-cover"
            />
          ) : post.image_url ? (
            <Image
              src={post.image_url}
              alt="preview"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
              画像を選択
            </div>
          )}
        </div>

        <input
          id="imageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onClick={(e) => {
            // ✅ 同じ画像でも再選択できるようにリセット
            (e.target as HTMLInputElement).value = "";
          }}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              setImageFile(file);
              const url = URL.createObjectURL(file);
              setImagePreview(url);
            }
          }}
        />

        {tagCategories.map((cat) => {
          const values = tagValues.filter((v) => v.category_id === cat.id);
          if (values.length === 0) return null;
          return (
            <div key={cat.id} className="space-y-2">
              <p className="text-sm text-zinc-900 font-light">{cat.label}</p>
              <div className="flex flex-wrap gap-2">
                {values.map((tag) => {
                  const selected = selectedTags[cat.id]?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggle(cat.id, tag.id)}
                      className={`h-6 px-2 rounded-[99px] text-xs leading-none ${selected
                        ? "bg-[#4B5C9E] text-white font-semibold"
                        : "bg-white text-zinc-600 font-light outline outline-1 outline-offset-[-1px] outline-zinc-200"
                        }`}
                    >
                      {tag.name_ja ?? "未設定"}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 text-sm">
            キャンセル
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading || !body || !storeId}
            className="bg-zinc-900 text-white px-4 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? "更新中..." : "更新"}
            <Image src="/post/post2.svg" alt="投稿" width={14} height={14} />
          </button>
        </div>
      </div>
    </div>
  );
}