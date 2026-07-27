import { ButtonHTMLAttributes } from "react";

type ToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function ToolButton({
  children,
  ...props
}: ToolButtonProps) {
  return (
    <button
      {...props}
      className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
    >
      {children}
    </button>
  );
}
