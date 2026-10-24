import { ReactNode } from "react";

export default function EncyclopediaPaper({ children }: { children: ReactNode }) {
  return (
    // APPROVED PHONE STANDARD rule B (globals.css): on phone the article's parts become items of the page's
    // phone flow, its cards rise to the collapsed-cards group and lib/phone/layout.ts redraws one paper frame.
    <div data-phone-article="" className="mt-16">
      <div
        data-phone-paper=""
        className="rounded-sm border border-[#e2d9c2] bg-[#faf7ef] p-4 font-serif shadow-sm sm:p-8 lg:p-12 dark:border-[#39352c] dark:bg-[#17160f] dark:shadow-none"
        style={{ color: "inherit" }}
      >
        <div data-encyclopedia-paper className="space-y-12 text-[#2b2820] dark:text-[#ded7c4]">{children}</div>
      </div>
    </div>
  );
}
