import { InputHTMLAttributes } from "react";

type ToolInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export default function ToolInput({
  label,
  hint,
  className = "",
  ...props
}: ToolInputProps) {
  return (
    <label className="block space-y-2">
      {label && (
        <span className="block text-sm font-semibold text-zinc-700">
          {label}
        </span>
      )}

      <input
        {...props}
        className={`w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
      />

      {hint && (
        <span className="block text-xs text-zinc-500">
          {hint}
        </span>
      )}
    </label>
  );
}
