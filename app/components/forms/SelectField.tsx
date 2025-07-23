"use client";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  publicStatus?: boolean;
  privateStatus?: boolean;
  className?: string;
};

export default function SelectField({
  label,
  value,
  onChange,
  options,
  required = false,
  publicStatus = false,
  privateStatus = false,
  className = "",
}: Props) {
  const status = publicStatus ? "公開" : privateStatus ? "非公開" : "";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1">
        <label className="text-sm text-zinc-900">{label}</label>
        {required && <span className="text-sm text-rose-700">*</span>}
        {status && (
          <div
            className={`h-3.5 px-1 rounded-sm flex justify-center items-center ${status === "公開" ? "bg-[#4B5C9E]" : "bg-zinc-600"
              }`}
          >
            <div className="text-[10px] text-white">{status}</div>
          </div>
        )}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200"
      >
        <option value="">選択してください</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}