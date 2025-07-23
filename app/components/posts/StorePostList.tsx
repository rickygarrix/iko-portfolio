import PostCard from "./PostCard";
import type { Post } from "@/types/post";

type Props = {
  posts: Post[];
  currentUserId?: string;
  onLike: (postId: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: string) => void;
  showTags?: boolean; // 追加
  showImage?: boolean; // 追加
};

export default function StorePostList({
  posts,
  currentUserId,
  onLike,
  onEdit,
  onDelete,
}: Props) {
  if (posts.length === 0) return null;

  return (
    <div className="max-w-[600px] mx-auto mt-10 px-4">
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard
              post={post}
              currentUserId={currentUserId}
              showTags
              showImage
              onLike={() => onLike(post.id)}
              onEdit={() => onEdit(post)}
              onDelete={() => onDelete(post.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}