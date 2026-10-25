import AdSpace from "./AdSpace";
import { ADS_ENABLED } from "@/lib/ads";

/**
 * A desktop in-content ad candidate on a section boundary (rendered by SectionCard and InfoSection,
 * never hand-placed by a tool). display:none until lib/ads.ts picks 3 of them before the first paint;
 * the 24px padding keeps the slot clear of the blocks around it, and the container query in AdSpace
 * sizes it 728x90, or 970x250 where the column is that wide. Nothing renders while ads are off.
 */
export default function DesktopAdSlot() {
  if (!ADS_ENABLED) return null;
  return (
    // suppressHydrationWarning: the pick (`data-show`) is set while the HTML is parsed, before hydration.
    <div data-desktop-ad="" suppressHydrationWarning className="@container py-6">
      <AdSpace variant="leaderboard" />
    </div>
  );
}
