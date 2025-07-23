"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  name: string;
  url: string;
  bio: string;
  avatarUrl: string | null;
  onChange: (key: "name" | "url" | "bio", value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onImageUpload: (file: File) => void;
  nameError?: string;
  postCount: number;
  receivedLikeCount: number;
  storeFollowCount: number;
};

export default function EditableProfileForm({
  name,
  url,
  bio,
  avatarUrl,
  onChange,
  onSubmit,
  onCancel,
  onImageUpload,
  nameError,
  postCount,
  receivedLikeCount,
  storeFollowCount,
}: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await onImageUpload(file);
    setIsUploading(false);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto mb-12">
      {/* アイコン */}
      <div>
        <p className="font-semibold mb-2">アイコン</p>
        <div
          className="relative w-24 h-24 mb-2 cursor-pointer"
          onClick={() => document.getElementById("avatarInput")?.click()}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              fill
              sizes="96px"
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <Image
                src="/post/picture.svg"
                alt="No Avatar"
                width={40}
                height={40}
              />
            </div>
          )}
        </div>
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* 名前 */}
      <div>
        <p className="font-semibold mb-1">名前（公開）</p>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
        {nameError && (
          <p className="text-sm text-red-500 mt-1">{nameError}</p>
        )}
      </div>

      {/* 自己紹介 */}
      <div>
        <p className="font-semibold mb-1">自己紹介（公開）</p>
        <textarea
          value={bio}
          onChange={(e) => onChange("bio", e.target.value)}
          rows={3}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {/* 関連URL */}
      <div>
        <p className="font-semibold mb-1">関連URL（公開）</p>
        <input
          type="text"
          value={url}
          onChange={(e) => onChange("url", e.target.value)}
          placeholder="https://example.com"
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {/* 統計 */}
      <div className="flex justify-between text-sm text-gray-500">
        <p>投稿数 {postCount}</p>
        <p>受け取ったいいね {receivedLikeCount}</p>
        <p>フォロー中の店舗 {storeFollowCount}</p>
      </div>

      {/* ボタン */}
      <div className="space-y-2">
        <button
          onClick={onSubmit}
          disabled={isUploading}
          className="w-full bg-black text-white rounded-xl py-2"
        >
          {isUploading ? "アップロード中..." : "保存する"}
        </button>

        <button
          onClick={onCancel}
          className="w-full border border-gray-500 text-gray-600 rounded-xl py-2"
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}