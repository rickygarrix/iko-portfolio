"use client";

type Props = {
  activeTab: number;
  onChange: (index: number) => void;
  postCount: number;
  likedCount: number;
  storeFollowCount: number;
};

export default function TabNavigation({
  activeTab,
  onChange,
  postCount,
  likedCount,
  storeFollowCount,
}: Props) {
  const tabs = [
    { label: "自分の投稿", count: postCount },
    { label: "いいね", count: likedCount },
    { label: "お気に入り", count: storeFollowCount },
  ];

  return (
    <div className="flex w-full border-b border-zinc-200">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`flex-1 p-2 text-sm text-center ${activeTab === index
            ? "border-b-2 border-slate-500 text-[#4B5C9E] font-semibold"
            : "border-b border-zinc-200 text-zinc-900 font-light"
            }`}
          onClick={() => onChange(index)}
        >
          {tab.label} {tab.count}
        </button>
      ))}
    </div>
  );
}