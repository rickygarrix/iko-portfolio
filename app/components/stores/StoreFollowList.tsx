"use client";

import Link from "next/link";

type Store = {
  id: string;
  name: string;
};

type StoreFollowListProps = {
  stores: Store[];
};

export default function StoreFollowList({ stores }: StoreFollowListProps) {
  if (!stores || stores.length === 0) {
    return <p className="text-gray-500 text-sm">フォロー中の店舗はまだありません。</p>;
  }

  return (
    <ul className="space-y-1">
      {stores.map((store) => (
        <li key={store.id}>
          <Link
            href={`/stores/${store.id}`}
            className="block text-blue-600 hover:underline"
          >
            {store.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}