"use client";

import PostList from "@/components/posts/PostList";
import type { Post } from "@/types/post";

type Props = {
  userId: string;
  type: "posts" | "likes";
  posts: Post[];
  onLike: (postId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
};

export default function PostSection({
  userId,
  type,
  posts,
  onLike,
  onEdit,
  onDelete,
}: Props) {
  const isLikePage = type === "likes";

  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        {isLikePage ? "いいねした投稿はありません。" : "投稿がありません。"}
      </p>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto space-y-4">
      <PostList
        posts={posts}
        currentUserId={userId}
        onLike={(id) => onLike(id)}
        onEdit={(post) => onEdit(post)}
        onDelete={(id) => onDelete(id)}
        showImage
        showTags
      />
    </div>
  );
}