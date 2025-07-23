type TagButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function TagButton({ label, selected, onClick }: TagButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`h-6 px-2 rounded-[99px] inline-flex justify-center items-center
        ${selected
          ? "bg-slate-500 border border-slate-500"
          : "bg-white border border-dashed border-zinc-300"
        }`}
    >
      <span
        className={`text-center ${selected
            ? "text-white text-xs font-semibold"
            : "text-zinc-600 text-xs font-light"
          } font-['Hiragino_Kaku_Gothic_ProN'] leading-none`}
      >
        {label}
      </span>
    </button>
  );
}