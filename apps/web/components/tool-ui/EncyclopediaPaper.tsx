import { ReactNode } from "react";

export default function EncyclopediaPaper({ children }: { children: ReactNode }) {
  return (
    <div className="mt-16">
      <div
        className="rounded-sm border border-[#e2d9c2] bg-[#faf7ef] p-4 font-serif shadow-sm sm:p-8 lg:p-12 dark:border-[#39352c] dark:bg-[#17160f] dark:shadow-none"
        style={{ color: "inherit" }}
      >
        <div className="space-y-12 text-[#2b2820] dark:text-[#ded7c4]">{children}</div>
      </div>
    </div>
  );
}
