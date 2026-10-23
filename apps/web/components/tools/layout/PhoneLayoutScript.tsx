import { phoneLayout } from "@/lib/phone/layout";
import PhoneLayoutRunner from "./PhoneLayoutRunner";

/** Inline pass of the approved phone layout (lib/phone/layout.ts), placed after the tool page's content. */
export default function PhoneLayoutScript() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `(${phoneLayout.toString()})(document.currentScript)` }} />
      <PhoneLayoutRunner />
    </>
  );
}
