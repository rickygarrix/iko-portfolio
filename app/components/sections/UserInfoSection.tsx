"use client";

import Image from "next/image";

type Props = {
  name: string;
  avatarUrl: string | null;
  bio: string;
  url: string;
  instagram?: string;
};

export default function UserInfoSection({
  name,
  avatarUrl,
  bio,
  url,
  instagram,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-300" />
        )}
        <div>
          <p className="text-lg font-bold">{name}</p>
          {url && (
            <a
              href={url.startsWith("http") ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 underline"
            >
              {url}
            </a>
          )}
          {instagram && (
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-sm text-pink-500"
            >
              @{instagram}
            </a>
          )}
        </div>
      </div>
      {bio && <p className="text-sm text-gray-700">{bio}</p>}
    </div>
  );
}