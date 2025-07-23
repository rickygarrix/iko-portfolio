"use client";

import PostCard from "./PostCard";
import type { Post } from "@/types/post";

type PostListProps = {
  posts: Post[];
  currentUserId?: string;
  onLike?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  isReported?: boolean;
  showTags?: boolean;
  showImage?: boolean;
};

export default function PostList({
  posts,
  currentUserId,
  onLike,
  onEdit,
  onDelete,
  onReport,
  isReported,
  showTags = true,
  showImage = true,
}: PostListProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-40">
        <p className="text-gray-500 text-sm">投稿がありません。</p>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLike={onLike}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
          isReported={isReported}
          showTags={showTags}
          showImage={showImage}
        />
      ))}
    </div>
  );
}