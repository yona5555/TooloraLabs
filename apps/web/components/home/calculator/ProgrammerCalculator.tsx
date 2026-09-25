"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Base = 2 | 8 | 10 | 16;
type BitwiseOp = "AND" | "OR" | "XOR" | "SHL" | "SHR";

const BASES: { base: Base; label: string }[] = [
  { base: 2, label: "BIN" },
  { base: 8, label: "OCT" },
  { base: 10, label: "DEC" },
  { base: 16, label: "HEX" },
];

const HEX_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

function digitAllowed(digit: string, base: Base): boolean {
  const value = parseInt(digit, 16);
  return value < base;
}

/** Every value is treated as an unsigned 32-bit integer for display and for every bitwise op, so BIN/OCT/HEX all stay consistent with each other (no sign-extension surprises from JS's 32-bit *signed* bitwise operators). */
function toBase(value: number, base: Base): string {
  return (value >>> 0).toString(base).toUpperCase();
}

function applyBitwiseOp(op: BitwiseOp, a: number, b: number): number {
  switch (op) {
    case "AND":
      return (a & b) >>> 0;
    case "OR":
      return (a | b) >>> 0;
    case "XOR":
      return (a ^ b) >>> 0;
    case "SHL":
      return (a << b) >>> 0;
    case "SHR":
      return a >>> b;
  }
}

/**
 * A self-contained integer/bitwise calculator with its own local state —
 * deliberately not sharing homeCalculatorReducer's expression-string model,
 * since base conversion and bitwise ops operate on plain 32-bit integers
 * with a completely different input/display shape (four simultaneous
 * base representations of one value, not a math expression string).
 */
export default function ProgrammerCalculator() {
  const tHome = useTranslations("homeCalculator");
  const [inputBase, setInputBase] = useState<Base>(10);
  const [inputBuffer, setInputBuffer] = useState("");
  const [committedValue, setCommittedValue] = useState(0);
  const [pending, setPending] = useState<{ op: BitwiseOp; value: number } | null>(null);

  const currentValue = inputBuffer === "" ? committedValue : (parseInt(inputBuffer, inputBase) || 0) >>> 0;

  function pressDigit(digit: string) {
    if (!digitAllowed(digit, inputBase)) return;
    setInputBuffer((prev) => prev + digit);
  }

  function pressClear() {
    setInputBuffer("");
    setCommittedValue(0);
    setPending(null);
  }

  function pressBackspace() {
    setInputBuffer((prev) => prev.slice(0, -1));
  }

  function pressOp(op: BitwiseOp) {
    setPending({ op, value: currentValue });
    setInputBuffer("");
  }

  function pressNot() {
    const result = ~currentValue >>> 0;
    setCommittedValue(result);
    setInputBuffer("");
    setPending(null);
  }

  function pressEquals() {
    if (!pending) return;
    const result = applyBitwiseOp(pending.op, pending.value, currentValue);
    setCommittedValue(result);
    setInputBuffer("");
    setPending(null);
  }

  function selectBase(base: Base) {
    // Switching the input base re-interprets whatever is currently
    // displayed (not the raw digit string, which may contain digits
    // invalid in the new base) as the new base's starting point — the
    // underlying numeric value never silently changes when you just look
    // at it in a different base.
    setInputBuffer("");
    setCommittedValue(currentValue);
    setInputBase(base);
  }

  const rows = useMemo(
    () => [
      ["1", "2", "3", "AND"],
      ["4", "5", "6", "OR"],
      ["7", "8", "9", "XOR"],
      ["A", "B", "C", "SHL"],
      ["D", "E", "F", "SHR"],
      ["0", "NOT", "⌫", "="],
    ],
    []
  );

  return (
    <div dir="ltr" className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
        {BASES.map(({ base, label }) => (
          <button
            key={base}
            type="button"
            onClick={() => selectBase(base)}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
              inputBase === base ? "bg-blue-500 text-white" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-zinc-50 to-blue-50/40 p-3 dark:border-blue-500/20 dark:from-zinc-800 dark:to-zinc-800/60">
        {BASES.map(({ base, label }) => (
          <div key={base} className={`flex items-center justify-between border-b border-zinc-200/60 py-1.5 last:border-0 dark:border-zinc-700/60 ${base === inputBase ? "font-bold text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-300"}`}>
            <span className="text-xs">{label}</span>
            <span className="truncate font-mono text-sm">{toBase(currentValue, base)}</span>
          </div>
        ))}
        {pending && <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{toBase(pending.value, 10)} {pending.op} …</p>}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {rows.flat().map((label) => {
          const isDigit = HEX_DIGITS.includes(label);
          const disabled = isDigit && !digitAllowed(label, inputBase);
          if (label === "=") {
            return (
              <button key={label} type="button" onClick={pressEquals} className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_rgba(30,58,138,0.9)] transition hover:bg-blue-500 active:translate-y-px active:shadow-none">
                =
              </button>
            );
          }
          if (label === "⌫") {
            return (
              <button key={label} type="button" onClick={pressBackspace} className="rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_rgba(185,28,28,0.9)] transition hover:bg-red-400 active:translate-y-px active:shadow-none">
                ⌫
              </button>
            );
          }
          if (label === "NOT") {
            return (
              <button key={label} type="button" onClick={pressNot} className="rounded-lg border border-zinc-200 bg-zinc-100 py-2.5 text-sm font-semibold text-zinc-700 shadow-[0_2px_0_rgba(0,0,0,0.06)] transition hover:bg-zinc-200 active:translate-y-px active:shadow-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                NOT
              </button>
            );
          }
          if (!isDigit) {
            return (
              <button
                key={label}
                type="button"
                onClick={() => pressOp(label as BitwiseOp)}
                className="rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_rgba(29,78,216,0.9)] transition hover:bg-blue-400 active:translate-y-px active:shadow-none"
              >
                {label}
              </button>
            );
          }
          return (
            <button
              key={label}
              type="button"
              disabled={disabled}
              onClick={() => pressDigit(label)}
              className="rounded-lg border border-zinc-300 bg-white py-2.5 text-sm font-semibold text-zinc-900 shadow-[0_3px_0_rgba(0,0,0,0.15)] transition hover:bg-zinc-50 active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none dark:border-zinc-400 dark:bg-zinc-500 dark:text-white"
            >
              {label}
            </button>
          );
        })}
        <button type="button" onClick={pressClear} className="col-span-4 mt-0.5 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-white shadow-[0_3px_0_rgba(180,83,9,0.9)] transition hover:bg-amber-400 active:translate-y-px active:shadow-none">
          {tHome("buttons.clearAll")}
        </button>
      </div>
    </div>
  );
}
