/**
 * The phone wordmark: the domain itself in capitals, never translated and
 * always LTR (it is English text, so it reads left to right on every locale).
 * Pinned to the site's Latin stack (Arial) so it is the same width and shape on
 * every locale; otherwise ar/hi pages render it in their own script fonts.
 * Shared by the header and the footer; callers add only size/placement classes.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span dir="ltr" className={`whitespace-nowrap font-[Arial,Helvetica,sans-serif] leading-none tracking-[0.02em] ${className}`}>
      <span className="font-bold text-[#5170ff] dark:text-[#8ea0ff]">TOOLORA</span>
      <span className="font-normal text-zinc-900 dark:text-white">LABS</span>
      <span className="font-light text-zinc-500 dark:text-[#5ce1e6]/80">.COM</span>
    </span>
  );
}
