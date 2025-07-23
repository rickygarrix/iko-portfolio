"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import type { Post } from "@/types/post";

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 50%, 60%)`;
};

type Props = {
  post: Post;
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  isReported?: boolean;
  showImage?: boolean;
  showTags?: boolean;
};

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onEdit,
  onDelete,
  onReport,
  isReported,
  showImage = true,
  showTags = true,
}: Props) {
  const isOwner = post.user_id === currentUserId;
  const isLiked = post.post_likes?.some((like) => like.user_id === currentUserId);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const username = post.user?.name || "ゲスト";
  const avatarUrl = post.user?.avatar_url;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="py-2 border-b border-zinc-200 flex gap-2">
      {/* 左：アイコン */}
      <Link href={`/users/${post.user?.id}`} className="flex-shrink-0">
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-900 bg-zinc-100">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ backgroundColor: stringToColor(username) }}
            >
              {username.charAt(0)}
            </div>
          )}
        </div>
      </Link>

      {/* 右：本文 */}
      <div className="flex-1 flex flex-col gap-1">
        {/* ユーザー名 */}
        <Link
          href={`/users/${post.user?.id}`}
          className="text-sm font-semibold text-zinc-900 leading-tight"
        >
          {username}
        </Link>

        {/* 店舗名 */}
        {post.store?.id && (
          <Link
            href={`/stores/${post.store.id}`}
            className="text-xs font-semibold text-[#4B5C9E] leading-none"
          >
            {post.store.name}
          </Link>
        )}

        {/* 本文 */}
        <div className="text-sm font-light text-zinc-900 leading-tight whitespace-pre-wrap">
          {post.body}
        </div>

        {/* 画像 */}
        {showImage && post.image_url && (
          <div className="w-full rounded border border-black/10 overflow-hidden">
            <Image
              src={post.image_url}
              alt="投稿画像"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* タグ */}
        {showTags && post.post_tag_values && post.post_tag_values.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {post.post_tag_values.map((tag) => (
              <div
                key={tag.id}
                className="px-2 py-1 bg-neutral-50 rounded inline-flex justify-center items-center gap-2"
              >
                <div className="text-center text-zinc-900 text-xs font-light leading-none">
                  {tag.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 下部 */}
        <div className="w-full flex items-center gap-2">
          {/* いいね */}
          <button
            onClick={() => onLike?.(post.id)}
            className="h-6 px-0.5 flex justify-center items-center gap-1"
          >
            <Heart
              size={12}
              fill={isLiked ? "currentColor" : "none"}
              strokeWidth={1.5}
              className="text-[#4B5C9E]"
            />
            <span className="text-[#4B5C9E] text-xs font-light leading-none">
              {post.post_likes?.length ?? 0}
            </span>
          </button>

          {/* 日付 */}
          <div className="flex-1 text-right text-zinc-900 text-[10px] font-light leading-none">
            {new Date(post.created_at).toLocaleString("ja-JP")}
          </div>

          {/* メニュー */}
          <div className="relative h-6 px-0.5" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              <div className="w-3 h-3 relative">
                <div className="w-0.5 h-0.5 left-0 top-[4.88px] absolute bg-zinc-900 rounded-full"></div>
                <div className="w-0.5 h-0.5 left-[4.88px] top-[4.88px] absolute bg-zinc-900 rounded-full"></div>
                <div className="w-0.5 h-0.5 left-[9.75px] top-[4.88px] absolute bg-zinc-900 rounded-full"></div>
              </div>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-10 bg-white border rounded shadow text-xs w-28">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(post);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-green-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => {
                        onDelete?.(post.id);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-rose-600"
                    >
                      削除
                    </button>
                  </>
                ) : isReported ? (
                  <div className="px-3 py-2 text-rose-400">通報済み</div>
                ) : (
                  <button
                    onClick={() => {
                      onReport?.(post.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-100 text-rose-600"
                  >
                    通報
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}