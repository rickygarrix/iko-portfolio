"use client";

type Props = {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function PageTabs({ tabs, activeIndex, onChange }: Props) {
  return (
    <div className="border-b border-gray-200 flex space-x-4">
      {tabs.map((label, idx) => (
        <button
          key={label}
          className={`pb-2 font-medium ${activeIndex === idx
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
            }`}
          onClick={() => onChange(idx)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}