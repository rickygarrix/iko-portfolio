"use client";

import { useEffect, useState } from "react";
import { followUser, unfollowUser, isFollowing } from "@/lib/actions/follow";

type FollowButtonProps = {
  currentUserId: string;
  targetUserId: string;
  onFollowChange?: () => void; // ← フォロー変更通知用（任意）
};

export default function FollowButton({
  currentUserId,
  targetUserId,
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      isFollowing(currentUserId, targetUserId).then(setFollowing);
    }
  }, [currentUserId, targetUserId]);

  const handleToggleFollow = async () => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;

    setLoading(true);

    if (following) {
      await unfollowUser(currentUserId, targetUserId);
    } else {
      await followUser(currentUserId, targetUserId);
    }

    setFollowing(!following);
    setLoading(false);

    // ✅ 親に変化を通知（任意）
    if (onFollowChange) {
      onFollowChange();
    }
  };

  if (currentUserId === targetUserId) return null; // 自分自身は非表示

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-3 py-1 text-sm rounded border ${following ? "bg-gray-200 text-gray-800" : "bg-blue-500 text-white"
        }`}
    >
      {loading ? "..." : following ? "フォロー中" : "フォロー"}
    </button>
  );
}