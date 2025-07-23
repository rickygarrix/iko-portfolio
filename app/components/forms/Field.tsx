export default function Field({
  label,
  value,
  onChange,
  required = false,
  textarea = false,
  publicStatus = false,
  privateStatus = false,
  readOnly = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
  publicStatus?: boolean;
  privateStatus?: boolean;
  readOnly?: boolean;
  className?: string;
}) {
  const status = publicStatus ? "公開" : privateStatus ? "非公開" : "";
  const placeholder =
    label === "関連URL" ? "https://otnv.jp" : "";

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* ラベルとステータス */}
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

      {/* 入力フィールド */}
      {readOnly ? (
        <div className="w-full p-2 bg-white rounded outline outline-1 outline-offset-[-0.5px] outline-zinc-200 text-zinc-900 text-base font-light leading-normal">
          {value || "（未設定）"}
        </div>
      ) : textarea ? (
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 rounded outline outline-1 outline-zinc-200 bg-white text-zinc-900 text-base"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-2 rounded outline outline-1 outline-zinc-200 bg-white text-zinc-900 text-base"
        />
      )}
    </div>
  );
}