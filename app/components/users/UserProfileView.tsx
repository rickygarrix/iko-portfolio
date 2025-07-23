import Image from "next/image";

type Props = {
  name: string;
  instagram?: string | null;
  url?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  onEditClick?: () => void;
};

export default function UserProfileView({
  name,
  instagram,
  url,
  bio,
  avatarUrl,
  onEditClick,
}: Props) {
  return (
    <div className="w-full max-w-[600px] mx-auto flex flex-col gap-4 px-4 py-6 bg-white">
      {/* 名前とアイコン */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-900 bg-zinc-100 shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="avatar"
              fill
              className="object-cover"
            />
          ) : (
            <Image
              src="/post/picture.svg"
              alt="no avatar"
              fill
              className="object-contain opacity-30"
            />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900 break-words">
            {name}
          </p>
        </div>
      </div>

      {/* プロフィール文 */}
      {bio && (
        <p className="text-sm font-light text-zinc-900 leading-tight">
          {bio}
        </p>
      )}

      {/* URL */}
      {(url || instagram) && (
        <div className="flex items-center gap-2">
          <Image
            src="/mypage/link.svg"
            alt="Link Icon"
            width={14}
            height={14}
            className="shrink-0"
          />
          <a
            href={url || instagram || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-light text-slate-500 break-all hover:underline"
          >
            {(url || instagram)?.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </div>
      )}

      {/* 編集ボタン */}
      {onEditClick && (
        <button
          onClick={onEditClick}
          className="h-12 w-full px-4 bg-white rounded-lg outline outline-1 outline-zinc-900 flex justify-center items-center gap-2 hover:bg-gray-50"
        >
          <span className="text-base text-zinc-900 font-light">
            ユーザー情報を編集
          </span>
        </button>
      )}
    </div>
  );
}