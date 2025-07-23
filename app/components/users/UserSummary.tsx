import Image from "next/image";

type Props = {
  user: {
    name: string;
    avatarUrl: string | null;
    instagram?: string | null;
    url?: string | null;
    bio?: string | null;
  };
};

export default function UserSummary({ user }: Props) {
  const avatarInitial = user.name?.[0] || "？";

  return (
    <div className="w-full max-w-[600px] mx-auto px-4 py-6 bg-white space-y-4">
      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <div className="w-16 h-16 relative">
            <Image
              src={user.avatarUrl}
              alt="avatar"
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-purple-400 text-white flex items-center justify-center text-2xl font-bold">
            {avatarInitial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{user.name}</p>
          {user.instagram && (
            <p className="text-sm text-gray-500 truncate">
              Instagram: {user.instagram}
            </p>
          )}
          {user.url && (
            <p className="text-sm text-gray-500 truncate">
              URL: {user.url}
            </p>
          )}
        </div>
      </div>
      <div>
      </div>
    </div>
  );
}