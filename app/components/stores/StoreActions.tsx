// components/stores/StoreActions.tsx

type Props = {
  isFollowing: boolean;
  followerCount: number;
  onPostClick: () => void;
  onFollowToggle: () => void;
};

export default function StoreActions({
  isFollowing,
  followerCount,
  onPostClick,
  onFollowToggle,
}: Props) {
  return (
    <div className="flex flex-col items-end gap-1 px-4 mb-4">
      <div className="flex gap-4">
        <button
          onClick={onPostClick}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          投稿する
        </button>
        <button
          className={`px-4 py-1 rounded text-white ${isFollowing
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 hover:bg-gray-700"
            }`}
          onClick={onFollowToggle}
        >
          {isFollowing ? "フォロー中" : "フォロー"}
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1">
        フォロワー数：{followerCount}人
      </p>
    </div>
  );
}