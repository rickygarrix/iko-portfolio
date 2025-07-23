// NewPostModal.tsx（デザイン修正版）

"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { TagValue } from "@/types/schema";

type Store = { id: string; name: string };

type Props = {
  stores: Store[];
  selectedStore?: Store;
  tagCategories: { id: string; label: string }[];
  tagValues: TagValue[];
  user: User;
  onClose: () => void;
  onPosted: () => void;
};

export default function NewPostModal({
  stores,
  selectedStore,
  tagCategories,
  tagValues,
  user,
  onClose,
  onPosted,
}: Props) {
  const [body, setBody] = useState("");
  const [storeName, setStoreName] = useState(selectedStore?.name ?? "");
  const [storeId, setStoreId] = useState<string | null>(selectedStore?.id ?? null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>(
    Object.fromEntries(tagCategories.map((cat) => [cat.id, []]))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();
      if (data) {
        setProfileName(data.name ?? "名無し");
        setAvatarUrl(data.avatar_url ?? null);
      }
    };
    loadProfile();
  }, [user.id]);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const filteredStores = useMemo(() => {
    if (!storeName) return [];
    return stores.filter((s) => s.name.includes(storeName));
  }, [storeName, stores]);

  const handleSelectStore = (store: Store) => {
    setStoreName(store.name);
    setStoreId(store.id);
  };

  const handleToggleTag = (categoryId: string, tagId: string) => {
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

  const handleSubmit = async () => {
    if (!body || !storeId) {
      alert("店舗とコメントは必須です");
      return;
    }
    setLoading(true);

    const { data: inserted, error } = await supabase
      .from("posts")
      .insert([{ user_id: user.id, body, store_id: storeId }])
      .select("id")
      .single();

    if (error || !inserted?.id) {
      alert("投稿に失敗しました");
      setLoading(false);
      return;
    }

    const postId = inserted.id;

    if (image) {
      const ext = image.name.split(".").pop();
      const filePath = `${postId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, image);
      if (!uploadError) {
        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);
        await supabase.from("posts").update({ image_url: data.publicUrl }).eq("id", postId);
      }
    }

    const tagInserts = Object.entries(selectedTags).flatMap(([catId, tags]) =>
      tags.map((tagId) => ({ post_id: postId, tag_category_id: catId, tag_value_id: tagId }))
    );
    if (tagInserts.length > 0) {
      await supabase.from("post_tag_values").insert(tagInserts);
    }

    setBody("");
    setStoreName("");
    setStoreId(null);
    setImage(null);
    setSelectedTags(Object.fromEntries(tagCategories.map((cat) => [cat.id, []])));
    onPosted();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-60">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl p-5 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center">
                {profileName.charAt(0)}
              </div>
            )}
            <p className="font-semibold text-base text-zinc-900">{profileName}</p>
          </div>
        </div>

        <input
          type="text"
          placeholder="店舗を入力"
          className="w-full border border-dashed border-zinc-300 px-3 py-2 rounded text-base text-zinc-900"

          value={storeId ? stores.find((s) => s.id === storeId)?.name ?? storeName : storeName}
          onChange={(e) => {
            setStoreName(e.target.value);
            setStoreId(null);
          }}
        />
        {storeName && !storeId && filteredStores.length > 0 && (
          <div className="border rounded mt-1">
            {filteredStores.map((s) => (
              <div key={s.id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleSelectStore(s)}>
                {s.name}
              </div>
            ))}
          </div>
        )}

        <div className="relative">
          <textarea
            className="w-full border border-dashed border-zinc-300 rounded p-2 text-base text-zinc-900"
            rows={4}
            value={body}
            maxLength={400}
            onChange={(e) => setBody(e.target.value)}
            placeholder="感想をおしえて！"
          />
          <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
            {body.length}/400
          </div>
        </div>


        <input
          id="imageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onClick={(e) => {
            (e.target as HTMLInputElement).value = "";
          }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImage(file);
              const url = URL.createObjectURL(file);
              setImagePreview(url);
            }
          }}
        />

        <div
          className="w-full aspect-[16/9] rounded outline outline-1 outline-offset-[-1px] outline-zinc-200 flex justify-center items-center overflow-hidden cursor-pointer relative"
          onClick={() => document.getElementById("imageInput")?.click()} // これだけでOK
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="preview"
              fill
              className="object-contain"
            />
          ) : (
            <div className="text-zinc-400 text-base font-light">画像を選択</div>
          )}
        </div>

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
                      onClick={() => handleToggleTag(cat.id, tag.id)}
                      className={`h-6 px-2 rounded-[99px] text-xs leading-none ${selected
                        ? "bg-[#4B5C9E] text-white font-semibold"
                        : "bg-white text-zinc-600 font-light outline outline-1 outline-offset-[-1px] outline-zinc-200"
                        }`}
                    >
                      {tag.name_ja}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}


        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onClose}
            className="text-zinc-500 text-sm px-4 py-2"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!body || !storeId || loading}
            className="bg-zinc-900 text-white px-5 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-50"
          >
            投稿
            <Image src="/post/post2.svg" alt="投稿" width={14} height={14} />
          </button>
        </div>

      </div>
    </div>
  );
}