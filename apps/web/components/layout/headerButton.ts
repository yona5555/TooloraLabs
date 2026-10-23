/**
 * Phone-only (< md) sizing shared by the header's icon buttons: a 36px visible
 * box with an invisible ::before inset -5px from the padding box (4px past the
 * 1px border) on every side, so the touch area stays 44×44. Neighbours sit 8px apart (gap-2), so hit areas meet but
 * never overlap. From md up nothing here applies and the buttons keep h-11.
 */
export const HEADER_ICON_BUTTON_PHONE =
  "relative max-md:h-9 max-md:w-9 max-md:rounded-lg max-md:before:absolute max-md:before:-inset-[5px] max-md:before:content-['']";

/**
 * Same for the language button: a fixed 44px width (fits "AR ⌄" in every
 * locale at text-xs), so its edges land on whole pixels like the icon buttons;
 * a text-sized fractional width made its neighbour's hit area snap 0.5px short.
 */
export const HEADER_LANGUAGE_BUTTON_PHONE =
  "relative max-md:h-9 max-md:w-11 max-md:justify-center max-md:gap-0.5 max-md:rounded-lg max-md:px-0 max-md:text-xs max-md:before:absolute max-md:before:-inset-[5px] max-md:before:content-['']";
