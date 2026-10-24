import type { ButtonHTMLAttributes } from "react";

export type ResultAction = "share" | "copy" | "print" | "download" | "export" | "save";

/**
 * LOCKED phone card order (visuals.md): every button that acts on a tool's result (Share / Export,
 * Copy, Print, Download, Save) renders through this component, so its card carries
 * `data-result-action` and the guard test (tests/phone-card-order.mjs) can hold that card at
 * place 2 among the open cards (place 1 when the input and the output are one card).
 */
export default function ResultActionButton({ action, type = "button", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { action: ResultAction }) {
  return <button type={type} data-result-action={action} {...rest} />;
}
