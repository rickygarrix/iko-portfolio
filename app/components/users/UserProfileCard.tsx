import Image from "next/image";

type Props = {
  name: string;
  avatarUrl?: string | null;
  instagram?: string | null;
  url?: string | null;
  bio?: string | null;
  onEditClick?: () => void; // あるかどうかで「自分」か「他人」か判定
};

export default function UserProfileCard({
  name,
  avatarUrl,
  instagram,
  url,
  bio,
  onEditClick,
}: Props) {
  const avatarInitial = name?.[0] || "？";

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 py-6 bg-white space-y-4">
      {/* アイコンと名前 */}
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-zinc-100 border border-zinc-900 shrink-0">
            <Image
              src={avatarUrl}
              alt="avatar"
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-purple-400 text-white flex items-center justify-center text-2xl font-bold shrink-0">
            {avatarInitial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 break-words">{name}</p>
        </div>
      </div>

      {/* bio */}
      {bio && (
        <p className="text-sm font-light text-zinc-900 leading-tight whitespace-pre-wrap">
          {bio}
        </p>
      )}

      {/* URL / Instagram（片方だけ or 両方） */}
      {(url || instagram) && (
        <div className="flex flex-col gap-1 text-sm text-slate-500">
          {instagram && (
            <div className="flex items-center gap-2">
              <Image
                src="/mypage/link.svg"
                alt="Instagram Icon"
                width={14}
                height={14}
                className="shrink-0"
              />
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline break-all"
              >
                Instagram: {instagram}
              </a>
            </div>
          )}
          {url && (
            <div className="flex items-center gap-2">
              <Image
                src="/mypage/link.svg"
                alt="URL Icon"
                width={14}
                height={14}
                className="shrink-0"
              />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline break-all"
              >
                URL: {url}
              </a>
            </div>
          )}
        </div>
      )}

      {/* 編集ボタン（自分のみ） */}
      {onEditClick && (
        <button
          onClick={onEditClick}
          className="h-12 w-full px-4 bg-white rounded-lg outline outline-1 outline-zinc-900 flex justify-center items-center gap-2 hover:bg-gray-50"
        >
          <span className="text-base text-zinc-900 font-light">ユーザー情報を編集</span>
        </button>
      )}
    </div>
  );
}